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
            },
        });

        console.log(`✅ Order ${order.id} saved to database`);

        // 5. Trigger M-Pesa Internal API
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

        try {
            console.log("Attempting to reach M-Pesa API at:", `${baseUrl}/api/mpesa/stkpush`);

            const mpesaRes = await fetch(`${baseUrl}/api/mpesa/stkpush`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Math.round(product.price * orderQuantity),
                    phoneNumber: "254703704389",
                    orderId: order.id,
                }),
            });

            if (!mpesaRes.ok) {
                const errorText = await mpesaRes.text();
                console.error(`M-Pesa Route Error (${mpesaRes.status}):`, errorText);
                throw new Error(`Internal API returned ${mpesaRes.status}`);
            }

            // If we reach here, M-Pesa push was successful
            return NextResponse.json({
                message: "STK Push Sent",
                redirectTo: `/paymentscreen?orderId=${order.id}`
            }, { status: 201 });

        } catch (mpesaErr: any) {
            console.error("DETAILED_GATEWAY_ERROR:", mpesaErr.message);
            // This returns the error back to the Cart Page
            return NextResponse.json({
                error: `Gateway Error: ${mpesaErr.message}. Ensure your server is running.`
            }, { status: 500 });
        }

    } catch (error: any) {
        // This catches errors in Prisma or Auth
        console.error("MAIN_ORDER_API_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}