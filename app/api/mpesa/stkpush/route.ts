import { NextResponse } from "next/server";
import { initiateSTKPush, normalizeKenyanPhone } from "@/lib/mpesa-service";

/**
 * POST /api/mpesa/stkpush
 *
 * Direct STK Push endpoint. Accepts { phoneNumber, amount, orderId }
 * and delegates to the shared mpesa-service.
 *
 * NOTE: The primary checkout flow goes through /api/order (which also
 * calls initiateSTKPush). This endpoint is available as a standalone
 * trigger if needed.
 */
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

        // Normalise phone — will throw if invalid
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