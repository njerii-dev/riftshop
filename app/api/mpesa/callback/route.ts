import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const data = await req.json();

    // This will print the actual payment details in your VS Code terminal
    console.log("🔔 M-Pesa Callback Received!");
    console.log(JSON.stringify(data, null, 2));

    // The 'ResultCode' 0 means the user entered their PIN successfully
    const resultCode = data.Body.stkCallback.ResultCode;

    if (resultCode === 0) {
        console.log("✅ Payment Verified Successfully");
        // TODO: Update your Neon database here
    } else {
        console.log("❌ Payment Cancelled or Failed");
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}