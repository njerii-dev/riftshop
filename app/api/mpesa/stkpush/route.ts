// lib/mpesa-service.ts

export async function initiateSTKPush(phoneNumber: string, amount: number, orderId: string) {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortCode = process.env.MPESA_SHORTCODE || "174379";
    const passkey = process.env.MPESA_PASSKEY;

    console.log("--- Starting M-Pesa Handshake ---");

    // 1. Get Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const tokenRes = await fetch(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );

        if (!tokenRes.ok) {
            const errorData = await tokenRes.text();
            throw new Error(`Token Generation Failed: ${tokenRes.status} - ${errorData}`);
        }

        const { access_token } = await tokenRes.json();
        console.log("✅ Token acquired");

        // 2. Generate Timestamp & Password
        const date = new Date();
        const timestamp = date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

        // 3. Call Safaricom
        console.log("Sending STK Push request to Safaricom...");
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
                    CallBackURL: process.env.CALLBACK_URL,
                    AccountReference: "RiftShop",
                    TransactionDesc: "Payment"
                }),
            }
        );

        const mpesaData = await mpesaRes.json();
        console.log("Safaricom Response:", mpesaData);

        return mpesaData;

    } catch (err: any) {
        console.error("DEBUG_MPESA_ERROR:", err.message);
        throw err; // Send the error up to the route handler
    }
}