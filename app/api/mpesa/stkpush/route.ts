import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, phoneNumber, orderId } = body;

        // Validate environment variables
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const shortCode = process.env.MPESA_SHORTCODE || "174379";
        const passkey = process.env.MPESA_PASSKEY;

        if (!consumerKey || !consumerSecret || !passkey) {
            console.error("Missing M-Pesa environment variables");
            return NextResponse.json(
                { error: "Payment service is not configured. Contact support." },
                { status: 500 }
            );
        }

        const cleanPhone = String(phoneNumber).replace(/\+/g, "");

        // 1. Generate Access Token
        const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

        const tokenRes = await fetch(url, {
            headers: { Authorization: `Basic ${auth}` },
            cache: 'no-store'
        });

        if (!tokenRes.ok) {
            const errorText = await tokenRes.text();
            console.error("Safaricom Auth Error:", tokenRes.status, errorText);
            return NextResponse.json(
                { error: `M-Pesa authentication failed (HTTP ${tokenRes.status})` },
                { status: 502 }
            );
        }

        let tokenData;
        try {
            tokenData = await tokenRes.json();
        } catch {
            return NextResponse.json(
                { error: "M-Pesa returned an invalid authentication response" },
                { status: 502 }
            );
        }

        const access_token = tokenData.access_token;
        if (!access_token) {
            console.error("No access token in response:", tokenData);
            return NextResponse.json(
                { error: "M-Pesa authentication failed. Check your credentials." },
                { status: 502 }
            );
        }

        // 2. Prepare STK Push
        const date = new Date();
        const timestamp = date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

        const callbackUrl = process.env.CALLBACK_URL
            || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mpesa/callback`;

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
                CallBackURL: callbackUrl,
                AccountReference: `Order${orderId || "123"}`,
                TransactionDesc: "Payment",
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("STK Push HTTP Error:", res.status, errorText);
            return NextResponse.json(
                { error: `M-Pesa STK Push failed (HTTP ${res.status})` },
                { status: 502 }
            );
        }

        let data;
        try {
            data = await res.json();
        } catch {
            return NextResponse.json(
                { error: "M-Pesa returned an invalid STK Push response" },
                { status: 502 }
            );
        }

        console.log("Safaricom Response:", data);
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Detailed STK Push Error:", error);
        return NextResponse.json(
            { error: error.message || "STK Push Failed" },
            { status: 500 }
        );
    }
}