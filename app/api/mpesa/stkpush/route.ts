import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, phoneNumber, orderId } = body;

        // Ensure variables exist to avoid "undefined" errors
        const consumerKey = process.env.MPESA_CONSUMER_KEY!;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
        const shortCode = process.env.MPESA_SHORTCODE || "174379";
        const passkey = process.env.MPESA_PASSKEY!;

        const cleanPhone = String(phoneNumber).replace(/\+/g, "");

        // 1. Generate Access Token
        const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

        const tokenRes = await fetch(url, {
            headers: { Authorization: `Basic ${auth}` },
            cache: 'no-store'
        });

        const tokenData = await tokenRes.json();
        const access_token = tokenData.access_token;

        if (!access_token) {
            console.error("Token Generation Failed:", tokenData);
            return NextResponse.json({ error: "Invalid Consumer Key/Secret" }, { status: 401 });
        }

        // 2. Prepare STK Push
        // Safaricom is very strict with the timestamp format
        const date = new Date();
        const timestamp = date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        // Fixed password generation logic
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

        const stkUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

        const res = await fetch(stkUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: Math.round(amount),
                PartyA: cleanPhone,
                PartyB: shortCode,
                PhoneNumber: cleanPhone,
                CallBackURL: process.env.CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
                AccountReference: `Order${orderId || "123"}`,
                TransactionDesc: "Payment",
            }),
        });

        const data = await res.json();
        console.log("Safaricom Response:", data);
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Detailed STK Push Error:", error);
        return NextResponse.json({ error: error.message || "STK Push Failed" }, { status: 500 });
    }
}