import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // CHANGE: Use phoneNumber to match what the Order route sends
        const { phoneNumber, amount } = body;

        if (!phoneNumber || !amount) {
            return NextResponse.json({ error: "Missing phone or amount" }, { status: 400 });
        }

        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        const tokenRes = await fetch(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        const shortCode = process.env.MPESA_SHORTCODE || "174379";
        const passkey = process.env.MPESA_PASSKEY;

        // Safaricom expects YYYYMMDDHHMMSS
        const date = new Date();
        const timestamp = date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

        const mpesaRes = await fetch(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
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
                    CallBackURL: process.env.CALLBACK_URL || "https://yourdomain.com/api/callback",
                    AccountReference: "RiftShop",
                    TransactionDesc: "Payment"
                }),
            }
        );

        const mpesaData = await mpesaRes.json();
        return NextResponse.json(mpesaData, { status: 200 });

    } catch (error: any) {
        console.error("M-Pesa API Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}