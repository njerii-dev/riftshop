import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Or your Neon connection client

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const callbackData = body.Body.stkCallback;

        // ResultCode 0 means SUCCESS
        if (callbackData.ResultCode === 0) {
            const checkoutID = callbackData.CheckoutRequestID;

            // Update the status in your Neon database
            await prisma.order.update({
                where: { checkoutRequestId: checkoutID }, // Ensure you save this ID when starting the push
                data: { status: "COMPLETED" },
            });

            console.log("Neon Database updated: COMPLETED");
        } else {
            // Handle cancelled/failed payments
            const checkoutID = callbackData.CheckoutRequestID;
            await prisma.order.update({
                where: { checkoutRequestId: checkoutID },
                data: { status: "FAILED" },
            });
        }

        return NextResponse.json({ message: "Received" });
    } catch (err) {
        console.error("Callback Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}