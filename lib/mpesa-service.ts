const SAFARICOM_SANDBOX_URL = "https://sandbox.safaricom.co.ke";



/**

 * Reads and validates M-Pesa environment variables.

 * Throws a clear error if any required credential is missing.

 */

function getMpesaConfig() {

    const consumerKey = process.env.MPESA_CONSUMER_KEY;

    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    const passkey = process.env.MPESA_PASSKEY;

    const shortCode = process.env.MPESA_SHORTCODE || "174379";

    const callbackUrl =

        process.env.CALLBACK_URL ||

        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mpesa/callback`;



    if (!consumerKey || !consumerSecret || !passkey) {

        throw new Error(

            "Missing M-Pesa credentials. Ensure MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, and MPESA_PASSKEY are set in your environment variables."

        );

    }



    return { consumerKey, consumerSecret, passkey, shortCode, callbackUrl };

}



/**

 * Generates the Safaricom timestamp (YYYYMMDDHHmmss) in East Africa Time (UTC+3).

 */

function getSafaricomTimestamp(): string {

    const now = new Date();

    // Format in EAT (Africa/Nairobi) — Safaricom expects Kenyan local time

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

    for (const p of eat) {

        parts[p.type] = p.value;

    }



    return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;

}



/**

 * Fetches an OAuth access token from Safaricom.

 */

async function getAccessToken(consumerKey: string, consumerSecret: string): Promise<string> {

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");



    const res = await fetch(

        `${SAFARICOM_SANDBOX_URL}/oauth/v1/generate?grant_type=client_credentials`,

        {

            headers: { Authorization: `Basic ${auth}` },

            cache: "no-store",

        }

    );



    if (!res.ok) {

        const errorText = await res.text();

        console.error("Safaricom Auth Error:", res.status, errorText);

        throw new Error(

            `M-Pesa authentication failed (HTTP ${res.status}). Check your Consumer Key and Secret.`

        );

    }



    const data = await res.json();



    if (!data.access_token) {

        console.error("Safaricom token response (no access_token):", data);

        throw new Error(

            "M-Pesa authentication succeeded but no access token was returned."

        );

    }



    return data.access_token;

}



/**

 * Cleans and normalises a Kenyan phone number to the 254XXXXXXXXX format.

 * Accepts: 0712345678, 712345678, +254712345678, 254712345678

 */

export function normalizeKenyanPhone(raw: string): string {

    let phone = String(raw).replace(/[\s+\-]/g, "");



    if (phone.startsWith("0")) {

        phone = "254" + phone.slice(1);

    } else if (/^[71]/.test(phone) && phone.length === 9) {

        phone = "254" + phone;

    }



    if (!/^254\d{9}$/.test(phone)) {

        throw new Error("Invalid phone number. Use format: 254XXXXXXXXX or 07XXXXXXXX");

    }



    return phone;

}



/**

 * Initiates an M-Pesa STK Push (Lipa Na M-Pesa Online).

 *

 * @param phoneNumber  - Kenyan phone number (any common format)

 * @param amount       - Amount in KES (must be > 0)

 * @param orderId      - Your internal order/reference ID

 * @returns  The raw Safaricom STK Push response object

 */

export async function initiateSTKPush(

    phoneNumber: string,

    amount: number,

    orderId: string | number

) {

    // --- validate inputs ---

    const cleanPhone = normalizeKenyanPhone(phoneNumber);



    if (!amount || amount <= 0) {

        throw new Error(`Invalid amount: ${amount}. Must be a positive number.`);

    }



    // --- config ---

    const { consumerKey, consumerSecret, passkey, shortCode, callbackUrl } = getMpesaConfig();



    // --- authenticate ---

    const accessToken = await getAccessToken(consumerKey, consumerSecret);



    // --- timestamp & password ---

    const timestamp = getSafaricomTimestamp();

    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");



    // --- build payload ---

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



    console.log("STK Push Request:", {

        ...payload,

        Password: "[REDACTED]",

    });



    // --- send STK push ---

    const res = await fetch(

        `${SAFARICOM_SANDBOX_URL}/mpesa/stkpush/v1/processrequest`,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${accessToken}`,

            },

            body: JSON.stringify(payload),

        }

    );



    if (!res.ok) {

        const errorText = await res.text();

        console.error("Safaricom STK Push Error:", res.status, errorText);

        throw new Error(

            `M-Pesa STK Push failed (HTTP ${res.status}). ${errorText}`

        );

    }



    const result = await res.json();

    console.log("STK Push Response:", result);

    return result;

}