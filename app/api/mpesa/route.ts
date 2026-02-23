import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // 1. Get the phone and amount from the request body
        const body = await req.json();
        const { phone, amount } = body;

        // 2. Get M-Pesa Access Token (The Handshake)
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        const tokenRes = await fetch(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;

        // 3. Prepare the STK Push variables
        const shortCode = process.env.MPESA_SHORTCODE || "174379";
        const passkey = process.env.MPESA_PASSKEY;
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

        const password = Buffer.from(
            `${shortCode}${passkey}${timestamp}`
        ).toString('base64');

        // 4. Initiate the STK Push
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
                    Amount: amount,
                    PartyA: phone,
                    PartyB: shortCode,
                    PhoneNumber: phone,
                    CallBackURL: process.env.CALLBACK_URL,
                    AccountReference: "RiftShop_Store",
                    TransactionDesc: "Payment for Goods"
                }),
            }
        );
        const mpesaData = await mpesaRes.json();

        // 5. Send success back to your frontend
        return NextResponse.json(mpesaData, { status: 200 });

    } catch (error: any) {
        console.error("M-Pesa API Error:", error.message);
        return NextResponse.json(
            { error: "Failed to initiate M-Pesa payment" },
            { status: 500 }
        );
    }
}