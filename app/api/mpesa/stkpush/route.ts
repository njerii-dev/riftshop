import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { amount, phoneNumber, orderId } = await request.json();

        // Ensure phone number is a string and remove any "+" sign
        const cleanPhone = String(phoneNumber).replace(/\+/g, "");

        // 1. Generate Access Token
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

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
        const shortCode = process.env.MPESA_SHORTCODE || "174379";
        const passkey = process.env.MPESA_PASSKEY;
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);

        const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

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
                CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
                AccountReference: `Order${orderId}`,
                TransactionDesc: "Payment",
            }),
        });

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Detailed STK Push Error:", error);
        return NextResponse.json({ error: error.message || "STK Push Failed" }, { status: 500 });
    }
}