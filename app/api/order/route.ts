import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateSTKPush } from "@/lib/mpesa-service";

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
            return NextResponse.json({ error: "Phone number is required for M-Pesa payment" }, { status: 400 });
        }

        // Clean the phone number: remove '+' and spaces, ensure it starts with 254
        let cleanPhone = String(phoneNumber).replace(/[\s+\-]/g, "");
        if (cleanPhone.startsWith("0")) {
            cleanPhone = "254" + cleanPhone.slice(1);
        }
        if (!/^254\d{9}$/.test(cleanPhone)) {
            return NextResponse.json(
                { error: "Invalid phone number. Use format: 254XXXXXXXXX or 07XXXXXXXX" },
                { status: 400 }
            );
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

            // Check if Safaricom rejected the request format
            if (mpesaResult.ResponseCode && mpesaResult.ResponseCode !== "0") {
                console.error("Safaricom Rejection:", mpesaResult);
                return NextResponse.json(
                    {
                        error: "M-Pesa request was rejected",
                        details: mpesaResult.CustomerMessage || mpesaResult.ResultDesc || "Unknown rejection reason",
                    },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                {
                    message: "STK Push Sent",
                    redirectTo: `/paymentscreen?orderId=${order.id}`,
                },
                { status: 201 }
            );
        } catch (mpesaError: any) {
            console.error("M-Pesa STK Push Error:", mpesaError.message);
            return NextResponse.json(
                {
                    error: "M-Pesa payment failed",
                    details: mpesaError.message,
                },
                { status: 502 }
            );
        }
    } catch (globalError: any) {
        console.error("ORDER_ROUTE_ERROR:", globalError.message);
        return NextResponse.json(
            { error: "Could not create order. Please try again." },
            { status: 500 }
        );
    }
}