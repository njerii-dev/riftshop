import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateSTKPush } from "@/lib/mpesa-service";

export async function POST(request: Request) {
    try {
        // Check Session
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const body = await request.json();
        const { productId, quantity } = body;

        // Find Product
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Create Order in DB
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                customerId: session.user.id
            }
        });

        // Trigger M-Pesa
        try {
            const mpesaResult = await initiateSTKPush(
                "254703704389", // Using your provided test number
                product.price * (quantity || 1),
                order.id
            );

            // Check if Safaricom rejected the request format
            if (mpesaResult.ResponseCode !== "0") {
                console.error("Safaricom Rejection:", mpesaResult);
                return NextResponse.json({
                    error: "M-Pesa Rejected",
                    details: mpesaResult.errorMessage || mpesaResult.ResultDesc
                }, { status: 400 });
            }

            return NextResponse.json({
                message: "STK Push Sent",
                redirectTo: `/paymentscreen?orderId=${order.id}`
            }, { status: 201 });

        } catch (mpesaError: any) {
            // This captures the "Internal Crash" details
            console.error("STK_PUSH_FUNCTION_ERROR:", mpesaError.message);
            return NextResponse.json({
                error: "Internal Crash",
                details: mpesaError.message
            }, { status: 500 });
        }

    } catch (globalError: any) {
        console.error("ORDER_ROUTE_ERROR:", globalError.message);
        return NextResponse.json({ error: "Could not create order" }, { status: 500 });
    }
}