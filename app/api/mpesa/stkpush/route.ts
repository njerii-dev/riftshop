import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { amount, phoneNumber, orderId } = await request.json();

        // 1. Generate Access Token
        const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
        const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");

        const tokenRes = await fetch(url, {
            headers: { Authorization: `Basic ${auth}` },
        });
        const { access_token } = await tokenRes.json();

        // 2. Prepare STK Push details
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
        const password = Buffer.from(
            process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
        ).toString("base64");

        const stkUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

        const res = await fetch(stkUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                BusinessShortCode: process.env.MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phoneNumber, // The phone number receiving the prompt
                PartyB: process.env.MPESA_SHORTCODE,
                PhoneNumber: phoneNumber,
                CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
                AccountReference: `Order-${orderId}`,
                TransactionDesc: "Payment for goods",
            }),
        });

        const data = await res.json();
        console.log("Safaricom Response:", data);

        return NextResponse.json(data);
    } catch (error) {
        console.error("STK Push Error:", error);
        return NextResponse.json({ error: "Failed to initiate M-Pesa" }, { status: 500 });
    }
}