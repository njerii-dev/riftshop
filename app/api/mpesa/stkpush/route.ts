import { NextResponse } from "next/server";
import { initiateSTKPush, normalizeKenyanPhone } from "@/lib/mpesa-service";
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, phoneNumber, orderId } = body;

        if (!phoneNumber || !amount) {
            return NextResponse.json(
                { error: "phoneNumber and amount are required." },
                { status: 400 }
            );
        }
        let cleanPhone: string;
        try {
            cleanPhone = normalizeKenyanPhone(phoneNumber);
        } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

        const data = await initiateSTKPush(cleanPhone, Number(amount), orderId || "direct");

        console.log("✅ STK Push triggered via /api/mpesa/stkpush:", data);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("🔥 /api/mpesa/stkpush error:", error.message);
        return NextResponse.json(
            { error: error.message || "An unexpected error occurred during payment processing." },
            { status: 502 }
        );
    }
}