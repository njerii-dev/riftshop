import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        console.log("🔔 M-Pesa Callback Received!");
        // Log the full body to see the structure in your terminal
        console.dir(data, { depth: null });

        const stkCallback = data.Body?.stkCallback;

        if (!stkCallback) {
            return NextResponse.json({ error: "Invalid Callback Data" }, { status: 400 });
        }

        const resultCode = stkCallback.ResultCode;
        const resultDesc = stkCallback.ResultDesc;
        const merchantRequestID = stkCallback.MerchantRequestID;
        const checkoutRequestID = stkCallback.CheckoutRequestID;

        // ResultCode 0 = Success
        if (resultCode === 0) {
            const metadata = stkCallback.CallbackMetadata.Item;

            // Extract values safely using helper
            const amount = metadata.find((item: any) => item.Name === "Amount")?.Value;
            const receipt = metadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
            const phone = metadata.find((item: any) => item.Name === "PhoneNumber")?.Value;

            console.log(`✅ Success! Receipt: ${receipt}, Amount: ${amount}, Phone: ${phone}`);

            /**
             * TODO: NEON DATABASE UPDATE
             * Example:
             * await sql`UPDATE orders SET status = 'paid', mpesa_receipt = ${receipt} 
             * WHERE checkout_id = ${checkoutRequestID}`;
             */

        } else {
            // ResultCode 1032 = User Cancelled, 1 = Insufficient Funds, etc.
            console.log(`❌ Payment Not Successful. Code: ${resultCode}, Message: ${resultDesc}`);

            /**
             * TODO: Update database to 'failed' or 'cancelled'
             */
        }

        // Safaricom requires this specific 200 OK response to stop retrying
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    } catch (error: any) {
        console.error("🔥 Callback Processing Error:", error);
        // Even if your code fails, return a 200 to Safaricom so they don't spam your endpoint
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" });
    }
}