import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        // 1. Authenticate the user via session
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be signed in to place an order" },
                { status: 401 }
            );
        }

        // 2. Parse the request body
        const body = await request.json();
        const { productId, quantity } = body;

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        const orderQuantity = quantity && quantity > 0 ? quantity : 1;

        // 3. Verify the product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: `Database does not recognize ID: ${productId}` },
                { status: 404 }
            );
        }

        // 4. Create order in the database
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                customerId: session.user.id,
            },
        });

        console.log(
            `🛒 Order placed in DB! User: ${session.user.email}, Product: ${product.name}, Order ID: ${order.id}`
        );

        // 5. TRIGGER M-PESA STK PUSH
        // We wrap this in a try/catch so the order still "succeeds" even if M-Pesa fails to trigger
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

            // NOTE: Ensure your session user has a phone field, 
            // otherwise replace session.user.phone with a phone number from the request body
            const userPhone = (session.user as any).phone || "2547XXXXXXXX";

            const mpesaResponse = await fetch(`${baseUrl}/api/mpesa/stkpush`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Math.round(product.price * orderQuantity), // M-Pesa doesn't like decimals
                    phoneNumber: userPhone,
                    orderId: order.id,
                }),
            });

            const mpesaResult = await mpesaResponse.json();
            console.log("M-Pesa API Response:", mpesaResult);

        } catch (mpesaError) {
            console.error("Failed to trigger M-Pesa STK Push:", mpesaError);
        }

        // 6. Final Success Response
        return NextResponse.json(
            {
                message: "Order placed and payment initiated",
                orderId: order.id,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Order API Error:", error);
        return NextResponse.json(
            { error: "Failed to process order" },
            { status: 500 }
        );
    }
}