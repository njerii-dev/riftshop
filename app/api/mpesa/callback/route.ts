import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        console.log("🔔 M-Pesa Callback Received!");
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
            const amount = metadata.find((item: any) => item.Name === "Amount")?.Value;
            const receipt = metadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
            const phone = metadata.find((item: any) => item.Name === "PhoneNumber")?.Value;

            console.log(`✅ Success! Receipt: ${receipt}, Amount: ${amount}, Phone: ${phone}`);

        } else {
            console.log(`❌ Payment Not Successful. Code: ${resultCode}, Message: ${resultDesc}`);
        }
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    } catch (error: any) {
        console.error("🔥 Callback Processing Error:", error);
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" });
    }
}