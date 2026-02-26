import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        // 1. Authenticate user
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        // 2. Parse request body
        const body = await request.json();
        const { productId, quantity } = body;
        const orderQuantity = quantity && quantity > 0 ? quantity : 1;

        // 3. Find the product
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // 4. Create the Order
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                customerId: session.user.id,
                // Add status if your schema supports it
                // status: "PENDING" 
            },
        });

        console.log(`✅ Order ${order.id} saved to database`);

        // 5. TRIGGER M-PESA (Wait for response this time)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // Use your real test number or get it from session.user
        const targetPhone = "254703704389";

        try {
            const mpesaRes = await fetch(`${baseUrl}/api/mpesa/stkpush`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Math.round(product.price * orderQuantity), // M-Pesa hates decimals
                    phoneNumber: targetPhone,
                    orderId: order.id,
                }),
            });

            const mpesaData = await mpesaRes.json();

            if (!mpesaRes.ok) {
                console.error("M-Pesa API rejected request:", mpesaData);
                return NextResponse.json({
                    error: "M-Pesa push failed. Please check your phone number and try again."
                }, { status: 400 });
            }

            // SUCCESS: Send to the payment screen
            return NextResponse.json({
                message: "STK Push Sent",
                redirectTo: `/paymentscreen?orderId=${order.id}`
            }, { status: 201 });

        } catch (mpesaErr) {
            console.error("Network error triggering M-Pesa:", mpesaErr);
            return NextResponse.json({ error: "Could not connect to payment gateway" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("ORDER_API_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}