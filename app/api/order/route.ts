import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateSTKPush, normalizeKenyanPhone } from "@/lib/mpesa-service";

export async function POST(request: Request) {
    try {
        // 1. Check Session
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        // 2. Parse and validate request body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { productId, quantity, phoneNumber } = body;

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        if (!phoneNumber) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }
        let cleanPhone: string;
        try {
            cleanPhone = normalizeKenyanPhone(phoneNumber);
        } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

        // 3. Find Product
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // 4. Create Order in DB
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                customerId: session.user.id,
            },
        });

        // 5. Trigger M-Pesa STK Push
        const totalAmount = product.price * (quantity || 1);

        try {
            const mpesaResult = await initiateSTKPush(
                cleanPhone,
                totalAmount,
                order.id
            );
            if (mpesaResult.ResponseCode === "0") {
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        checkoutRequestId: mpesaResult.CheckoutRequestID
                    }
                });

                return NextResponse.json(
                    {
                        message: "STK Push Sent",
                        redirectTo: `/paymentscreen?orderId=${order.id}`,
                    },
                    { status: 201 }
                );
            } else {
                console.error("Safaricom Rejection:", mpesaResult);
                return NextResponse.json(
                    {
                        error: "M-Pesa request was rejected",
                        details: mpesaResult.CustomerMessage || "Unknown rejection reason",
                    },
                    { status: 400 }
                );
            }
        } catch (mpesaError: any) {
            console.error("M-Pesa STK Push Error:", mpesaError.message);
            return NextResponse.json(
                { error: "M-Pesa payment failed", details: mpesaError.message },
                { status: 502 }
            );
        }
    } catch (globalError: any) {
        console.error("ORDER_ROUTE_ERROR:", globalError.message);
        return NextResponse.json(
            { error: "Could not create order." },
            { status: 500 }
        );
    }
}