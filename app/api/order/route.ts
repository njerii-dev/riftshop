import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        // 2. Parse Body
        const body = await request.json();
        const { productId, quantity } = body;
        const orderQuantity = quantity && quantity > 0 ? quantity : 1;

        // 3. Verify Product in Neon
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // 4. Create the Order (This is what was working before)
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                customerId: session.user.id,
            },
        });

        console.log(`✅ Order ${order.id} saved to Neon!`);

        // 5. TRIGGER M-PESA
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

            fetch(`${baseUrl}/api/mpesa/stkpush`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: product.price * orderQuantity,
                    phoneNumber: "254703704389",
                    orderId: order.id,
                }),
            }).catch(err => console.error("M-Pesa background fetch failed:", err));

        } catch (mpesaError) {
            console.error("M-Pesa trigger skipped:", mpesaError);
        }
        // Change the redirect path to the new folder location
        return NextResponse.json({
            message: "Order placed",
            orderId: order.id,
            redirectTo: `/paymentscreen?orderId=${order.id}` // Remove the "/api/mpesa" part
        }, { status: 201 });

    } catch (error: any) {
        console.error("ORDER_API_ERROR:", error);
        return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
    }
}