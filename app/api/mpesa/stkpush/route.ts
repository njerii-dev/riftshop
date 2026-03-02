import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, phoneNumber, orderId } = body;

        // 1. Validate Environment Variables
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const shortCode = process.env.MPESA_SHORTCODE || "174379";
        const passkey = process.env.MPESA_PASSKEY;

        if (!consumerKey || !consumerSecret || !passkey) {
            console.error("❌ MISSING CONFIG: Check your .env file for MPESA keys.");
            return NextResponse.json(
                { error: "Payment service is not configured correctly." },
                { status: 500 }
            );
        }

        // 2. Robust Phone Number Formatting (Convert 07... or +254... to 254...)
        let cleanPhone = String(phoneNumber).replace(/\D/g, ""); // Remove non-digits
        if (cleanPhone.startsWith("0")) {
            cleanPhone = "254" + cleanPhone.substring(1);
        } else if (cleanPhone.startsWith("7") || cleanPhone.startsWith("1")) {
            cleanPhone = "254" + cleanPhone;
        }

        // 3. Generate Access Token
        const authUrl = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
        const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

        const tokenRes = await fetch(authUrl, {
            headers: { Authorization: `Basic ${authHeader}` },
            cache: 'no-store'
        });

        if (!tokenRes.ok) {
            const errorData = await tokenRes.text();
            console.error("❌ SAFARICOM AUTH ERROR:", errorData);
            return NextResponse.json({ error: "M-Pesa authentication failed." }, { status: 502 });
        }

        const { access_token } = await tokenRes.json();

        // 4. Prepare Timestamp & Password
        // Safaricom expects YYYYMMDDHHMMSS
        const timestamp = new Date().toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, 14);

        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

        // 5. Setup Callback URL
        // Priority: .env CALLBACK_URL > NEXT_PUBLIC_APP_URL > Localhost
        const callbackUrl = process.env.CALLBACK_URL
            || `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-ngrok-url.ngrok-free.app'}/api/mpesa/callback`;

        // 6. Initiate STK Push
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
                TransactionDesc: "Payment for Order",
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("❌ STK PUSH REJECTED:", data);
            return NextResponse.json(
                { error: data.errorMessage || "STK Push failed" },
                { status: res.status }
            );
        }

        console.log("✅ STK PUSH TRIGGERED:", data);
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("🔥 INTERNAL SERVER ERROR:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred during payment processing." },
            { status: 500 }
        );
    }
}