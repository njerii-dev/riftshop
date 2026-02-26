import { Buffer } from "buffer";

export async function initiateSTKPush(phoneNumber: string, amount: number, orderId: any) {
    // 1. Validate environment variables BEFORE making any requests
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortCode = process.env.MPESA_SHORTCODE || "174379";
    const passkey = process.env.MPESA_PASSKEY;

    if (!consumerKey || !consumerSecret || !passkey) {
        throw new Error(
            "Missing M-Pesa credentials. Ensure MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, and MPESA_PASSKEY are set in your .env file."
        );
    }

    // 2. Validate inputs
    if (!phoneNumber || !amount || amount <= 0) {
        throw new Error(
            `Invalid STK push parameters: phoneNumber=${phoneNumber}, amount=${amount}`
        );
    }

    // 3. Generate Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenRes = await fetch(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
            headers: { Authorization: `Basic ${auth}` },
            cache: 'no-store',
        }
    );

    if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error("Safaricom Auth HTTP Error:", tokenRes.status, errorText);
        throw new Error(
            `M-Pesa authentication failed (HTTP ${tokenRes.status}). Check your Consumer Key and Secret.`
        );
    }

    let tokenData;
    try {
        tokenData = await tokenRes.json();
    } catch {
        throw new Error("M-Pesa authentication returned an invalid response. The sandbox may be down.");
    }

    const access_token = tokenData.access_token;
    if (!access_token) {
        console.error("Safaricom token response:", tokenData);
        throw new Error(
            "M-Pesa authentication succeeded but no access token was returned. Check your credentials."
        );
    }

    // 4. Generate Timestamp (YYYYMMDDHHMMSS)
    const date = new Date();
    const timestamp = date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);

    // 5. Generate Password
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // 6. Call Safaricom STK Push
    const callbackUrl = process.env.CALLBACK_URL
        || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mpesa/callback`;

    const stkPayload = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: "RiftShop",
        TransactionDesc: `Order ${String(orderId).slice(-5)}`,
    };

    console.log("STK Push Request:", {
        ...stkPayload,
        Password: "[REDACTED]",
        CallBackURL: callbackUrl,
    });

    const mpesaRes = await fetch(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify(stkPayload),
        }
    );

    if (!mpesaRes.ok) {
        const errorText = await mpesaRes.text();
        console.error("Safaricom STK Push HTTP Error:", mpesaRes.status, errorText);
        throw new Error(
            `M-Pesa STK Push request failed (HTTP ${mpesaRes.status}). ${errorText}`
        );
    }

    let result;
    try {
        result = await mpesaRes.json();
    } catch {
        throw new Error("M-Pesa STK Push returned an invalid response.");
    }

    console.log("STK Push Response:", result);
    return result;
}