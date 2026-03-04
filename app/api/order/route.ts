import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateSTKPush, normalizeKenyanPhone } from "@/lib/mpesa-service";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }
        const body = await request.json();
        const { productId, quantity, phoneNumber } = body;

        if (!productId || !phoneNumber) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const cleanPhone = normalizeKenyanPhone(phoneNumber)
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                customerId: session.user.id,
                status: "STARTING"
            },
        });

        // 5.  M-Pesa STK Push
        const totalAmount = product.price * (quantity || 1);

        try {
            console.log(`[STK] Triggering for Order ${order.id} to ${cleanPhone}`);

            const mpesaResult = await initiateSTKPush(
                cleanPhone,
                totalAmount,
                order.id
            );
            console.log("Safaricom API Response:", JSON.stringify(mpesaResult));
            if (String(mpesaResult.ResponseCode) === "0") {
                const checkoutID = mpesaResult.CheckoutRequestID;

                if (!checkoutID) {
                    throw new Error("Safaricom accepted request but did not return a CheckoutRequestID");
                }

                console.log(`[NEON] Attempting to save CheckoutID: ${checkoutID}`);
                const updatedOrder = await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        checkoutRequestId: checkoutID,
                        status: "PENDING"
                    }
                });

                // Create initial mpesa_payments record
                await prisma.mpesa_payments.create({
                    data: {
                        checkout_request_id: checkoutID,
                        phone_number: cleanPhone,
                        amount: totalAmount,
                        status: "PENDING",
                    }
                });

                console.log(`[SUCCESS] Database updated for ${updatedOrder.id}`);

                return NextResponse.json({
                    message: "STK Push Sent",
                    orderId: order.id,
                    checkoutID: checkoutID,
                    redirectTo: `/paymentscreen?orderId=${order.id}`,
                }, { status: 201 });

            } else {
                console.error("Safaricom Rejected Request:", mpesaResult.ResponseDesc);
                return NextResponse.json({
                    error: "M-Pesa rejected the request",
                    details: mpesaResult.CustomerMessage
                }, { status: 400 });
            }

        } catch (mpesaError: any) {
            console.error("STK Push or DB Update Failed:", mpesaError.message);
            return NextResponse.json({
                error: "Payment service error",
                details: mpesaError.message
            }, { status: 502 });
        }
    } catch (globalError: any) {
        console.error("ORDER_ROUTE_ERROR:", globalError.message);
        return NextResponse.json({ error: "Server error occurred" }, { status: 500 });
    }
}