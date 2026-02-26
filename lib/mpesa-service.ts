import { Buffer } from "buffer"; // Added to fix ReferenceError: Buffer is not defined

export async function initiateSTKPush(phoneNumber: string, amount: number, orderId: any) {
    // Ensure credentials exist
    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const shortCode = process.env.MPESA_SHORTCODE || "174379";
    const passkey = process.env.MPESA_PASSKEY!;

    try {
        // 1. Generate Access Token
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const tokenRes = await fetch(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );

        const tokenData = await tokenRes.json();
        const access_token = tokenData.access_token;

        if (!access_token) {
            throw new Error("M-Pesa Authentication Failed. Check your Key and Secret in .env");
        }

        // 2. Generate Timestamp (YYYYMMDDHHMMSS)
        const date = new Date();
        const timestamp = date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        // 3. Generate Password
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

        // 4. Call Safaricom STK Push
        const mpesaRes = await fetch(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    BusinessShortCode: shortCode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: Math.round(amount),
                    PartyA: phoneNumber,
                    PartyB: shortCode,
                    PhoneNumber: phoneNumber,
                    CallBackURL: process.env.CALLBACK_URL || "https://google.com",
                    AccountReference: "RiftShop",
                    // Convert orderId to string to prevent .slice() crash on numbers
                    TransactionDesc: `Order ${String(orderId).slice(-5)}`
                }),
            }
        );

        const result = await mpesaRes.json();
        return result;

    } catch (error: any) {
        // This ensures the error is passed up to the Route handler
        throw new Error(error.message);
    }
}