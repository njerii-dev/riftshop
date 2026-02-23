import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

// 1. Load your .env variables
dotenv.config();

const app = express();
app.use(express.json()); // Essential: This lets your server read JSON data

const PORT = 3000;

// 2. M-Pesa Configuration (Pulled from your .env)
const mpesaConfig = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    passkey: process.env.MPESA_PASSKEY,
    shortCode: "174379", // Standard Sandbox Shortcode
    callbackUrl: process.env.CALLBACK_URL, // This must be your Ngrok URL
};

// --- HELPER: GET ACCESS TOKEN ---
async function getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
    const { data } = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        { headers: { Authorization: `Basic ${auth}` } }
    );
    return data.access_token;
}

// --- ROUTE 1: INITIATE STK PUSH ---
// This is the endpoint RiftShop will call to start a payment
app.post('/api/pay', async (req: Request, res: Response) => {
    const { phone, amount } = req.body; // e.g., { "phone": "254712345678", "amount": 1 }

    try {
        const token = await getAccessToken();
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

        // The dynamic password Safaricom requires
        const password = Buffer.from(
            `${mpesaConfig.shortCode}${mpesaConfig.passkey}${timestamp}`
        ).toString('base64');

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: mpesaConfig.shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phone,
                PartyB: mpesaConfig.shortCode,
                PhoneNumber: phone,
                CallBackURL: mpesaConfig.callbackUrl,
                AccountReference: "RiftShop_Order",
                TransactionDesc: "Practice Payment"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        res.status(200).json({ message: "STK Push initiated!", details: response.data });
    } catch (error: any) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Failed to initiate M-Pesa payment" });
    }
});

// --- ROUTE 2: THE CALLBACK ---
// This is where M-Pesa sends the "Success" or "Failed" message
app.post('/api/callback', (req: Request, res: Response) => {
    console.log('--- CALLBACK RECEIVED FROM SAFARICOM ---');
    console.log(JSON.stringify(req.body, null, 2));

    const result = req.body.Body.stkCallback;
    if (result.ResultCode === 0) {
        // Handle SUCCESS: Update RiftShop DB to "Paid"
        console.log("Payment was SUCCESSFUL!");
    } else {
        // Handle FAILURE: Log why it failed (e.g., cancelled)
        console.log(`Payment FAILED: ${result.ResultDesc}`);
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

app.listen(PORT, () => {
    console.log(`🚀 RiftShop Server is alive at http://localhost:${PORT}`);
});