import axios from 'axios';
import dotenv from 'dotenv';

// Load variables from your .env file
dotenv.config();

/**
 * RiftShop M-Pesa Service
 * This file handles Authentication and the STK Push request.
 */
export class MpesaService {
    private consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    private consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    private shortCode = process.env.MPESA_SHORTCODE || '174379';
    private passkey = process.env.MPESA_PASSKEY || '';
    private callbackUrl = process.env.CALLBACK_URL || '';

    /**
     * PHASE 1: Get the OAuth Access Token from Safaricom
     */
    async getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

        try {
            const response = await axios.get(
                'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );
            return response.data.access_token;
        } catch (error: any) {
            console.error('Auth Error:', error.response?.data || error.message);
            throw new Error('Could not authenticate with Safaricom');
        }
    }

    /**
     * PHASE 2: Trigger the STK Push (PIN Prompt on phone)
     * @param amount - How much the customer is paying
     * @param phoneNumber - Format: 2547XXXXXXXX
     * @param orderId - The RiftShop Order ID for tracking
     */
    async sendStkPush(amount: number, phoneNumber: string, orderId: string) {
        try {
            const token = await this.getAccessToken();

            // Generate the Timestamp (YYYYMMDDHHMMSS)
            const date = new Date();
            const timestamp =
                date.getFullYear().toString() +
                ("0" + (date.getMonth() + 1)).slice(-2) +
                ("0" + date.getDate()).slice(-2) +
                ("0" + date.getHours()).slice(-2) +
                ("0" + date.getMinutes()).slice(-2) +
                ("0" + date.getSeconds()).slice(-2);

            // Create the Password
            const password = Buffer.from(
                this.shortCode + this.passkey + timestamp
            ).toString('base64');

            const payload = {
                BusinessShortCode: this.shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: this.shortCode,
                PhoneNumber: phoneNumber,
                CallBackURL: this.callbackUrl,
                AccountReference: orderId,
                TransactionDesc: `Payment for RiftShop Order ${orderId}`
            };

            const response = await axios.post(
                'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('STK Push Sent Successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('STK Push Error:', error.response?.data || error.message);
            throw new Error('Failed to send STK Push');
        }
    }
}