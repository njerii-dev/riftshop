// lib/mpesa-service.ts

export async function initiateSTKPush(phoneNumber: string, amount: number, orderId: string) {
    // 1. Get credentials from .env
    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const shortCode = process.env.MPESA_SHORTCODE || "174379";
    const passkey = process.env.MPESA_PASSKEY!;

    // 2. Generate Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const tokenRes = await fetch(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
            method: 'GET',
            headers: { Authorization: `Basic ${auth}` }
        }
    );

    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
        throw new Error("Could not generate M-Pesa Access Token. Check your Key/Secret.");
    }

    // 3. Generate Timestamp (YYYYMMDDHHMMSS)
    const date = new Date();
    const timestamp = date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);

    // 4. Generate Password
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // 5. Call Safaricom STK Push
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
                TransactionDesc: `Order ${orderId.slice(-5)}`
            }),
        }
    );

    const result = await mpesaRes.json();
    return result;
}