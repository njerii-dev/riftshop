import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { CheckoutRequestID, ResultCode, ResultDesc } = body.Body.stkCallback;

        console.log(`Event Received for ID: ${CheckoutRequestID}`);

        if (ResultCode === 0) {
            await prisma.order.update({
                where: { checkoutRequestId: CheckoutRequestID },
                data: { status: "COMPLETED" }
            });
            return NextResponse.json({ message: "Success received" });
        } else {
            await prisma.order.update({
                where: { checkoutRequestId: CheckoutRequestID },
                data: { status: "FAILED" }
            });
            return NextResponse.json({ message: "Failure recorded" });
        }
    } catch (error) {
        console.error("Callback Listener Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}