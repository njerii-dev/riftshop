import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const body = await request.json();
        const { productId } = body;

        // 1. Get Product Details
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not in database" }, { status: 404 });
        }

        // 2. Create the Order in Neon
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                customerId: session.user.id,
            },
        });

        console.log("✅ Step 1: Order saved to Neon ID:", order.id);

        // 3. TRIGGER M-PESA (The part that is likely failing)
        // Note: Change 'localhost:3000' to your actual URL if you have deployed to Vercel
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        console.log("🛰️ Step 2: Attempting to contact M-Pesa route at:", `${baseUrl}/api/mpesa/stkpush`);

        const mpesaResponse = await fetch(`${baseUrl}/api/mpesa/stkpush`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: product.price,
                phoneNumber: "254703704389",
                orderId: order.id,
            }),
        });

        if (!mpesaResponse.ok) {
            const errorText = await mpesaResponse.text();
            console.error("❌ Step 3: The M-Pesa route returned an error:", errorText);
            return NextResponse.json({
                error: "Order saved, but M-Pesa failed to start.",
                debug: errorText
            }, { status: 500 });
        }

        const mpesaResult = await mpesaResponse.json();
        console.log("🚀 Step 4: Safaricom says:", mpesaResult);

        return NextResponse.json({
            message: "Success! Check your phone for the M-Pesa prompt.",
            orderId: order.id,
            mpesa: mpesaResult
        }, { status: 201 });

    } catch (error: any) {
        // This catch block tells us IF the code itself has a typo or a crash
        console.error("🔥 CRITICAL CRASH:", error.message);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}