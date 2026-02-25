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

        // 3. Find the product in Neon
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // 4. Create the Order in Neon
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                customerId: session.user.id,
            },
        });

        console.log(`✅ Order ${order.id} saved to database`);

        // 5. TRIGGER M-PESA (Background Task)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // We use a non-awaited fetch so the user doesn't wait for Safaricom to respond
        fetch(`${baseUrl}/api/mpesa/stkpush`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: product.price * orderQuantity,
                phoneNumber: "254703704389", // Hardcoded for your test
                orderId: order.id,
            }),
        }).catch(err => console.error("M-Pesa trigger failed:", err));

        return NextResponse.json({
            message: "Order placed successfully",
            orderId: order.id,
            redirectTo: `/paymentscreen?orderId=${order.id}`
        }, { status: 201 });

    } catch (error: any) {
        console.error("ORDER_API_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}