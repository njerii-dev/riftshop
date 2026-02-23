import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        // 1. Get the phone and amount from the request body
        const body = await req.json();
        const { phone, amount } = body;

        // 2. Get M-Pesa Access Token (The Handshake)
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        const tokenResponse = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );
        const token = tokenResponse.data.access_token;

        // 3. Prepare the STK Push variables
        const shortCode = process.env.MPESA_SHORTCODE || "174379";
        const passkey = process.env.MPESA_PASSKEY;
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

        const password = Buffer.from(
            `${shortCode}${passkey}${timestamp}`
        ).toString('base64');

        // 4. Initiate the STK Push
        const mpesaResponse = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
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
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // 5. Send success back to your frontend
        return NextResponse.json(mpesaResponse.data, { status: 200 });

    } catch (error: any) {
        console.error("M-Pesa API Error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Failed to initiate M-Pesa payment", details: error.response?.data },
            { status: 500 }
        );
    }
}