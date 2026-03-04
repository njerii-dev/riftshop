const SAFARICOM_SANDBOX_URL = "https://sandbox.safaricom.co.ke";
function getMpesaConfig() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const passkey = process.env.MPESA_PASSKEY;
    const shortCode = process.env.MPESA_SHORTCODE || "174379";
    const callbackUrl =
        process.env.CALLBACK_URL ||
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mpesa/callback`;

    if (!consumerKey || !consumerSecret || !passkey) {
        throw new Error("Missing M-Pesa credentials. Check your .env file.");
    }

    return { consumerKey, consumerSecret, passkey, shortCode, callbackUrl };
}
function getSafaricomTimestamp(): string {
    const now = new Date();
    const eat = new Intl.DateTimeFormat("en-KE", {
        timeZone: "Africa/Nairobi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(now);

    const parts: Record<string, string> = {};
    for (const p of eat) { parts[p.type] = p.value; }
    return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}
async function getAccessToken(consumerKey: string, consumerSecret: string): Promise<string> {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const res = await fetch(`${SAFARICOM_SANDBOX_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` },
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`M-Pesa Auth Failed: ${res.status}`);
    const data = await res.json();
    return data.access_token;
}
export function normalizeKenyanPhone(raw: string): string {
    let phone = String(raw).replace(/[\s+\-]/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.slice(1);
    else if (/^[71]/.test(phone) && phone.length === 9) phone = "254" + phone;

    if (!/^254\d{9}$/.test(phone)) throw new Error("Invalid Kenyan phone number.");
    return phone;
}
export async function initiateSTKPush(
    phoneNumber: string,
    amount: number,
    orderId: string | number
) {
    const cleanPhone = normalizeKenyanPhone(phoneNumber);
    const { consumerKey, consumerSecret, passkey, shortCode, callbackUrl } = getMpesaConfig();
    const accessToken = await getAccessToken(consumerKey, consumerSecret);
    const timestamp = getSafaricomTimestamp();
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

    const payload = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: cleanPhone,
        PartyB: shortCode,
        PhoneNumber: cleanPhone,
        CallBackURL: callbackUrl,
        AccountReference: "RiftShop",
        TransactionDesc: `Order ${String(orderId).slice(-8)}`,
    };

    console.log("--- Sending STK Push ---");
    const res = await fetch(`${SAFARICOM_SANDBOX_URL}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("Safaricom API Raw Result:", JSON.stringify(result));

    if (!res.ok) {
        throw new Error(result.errorMessage || "STK Push failed at Safaricom Gateway");
    }

    return result;
}