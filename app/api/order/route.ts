// app/api/order/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateSTKPush } from "@/lib/mpesa-service"; // <--- Import our new helper!

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Sign in required" }, { status: 401 });
        }

        const body = await request.json();
        const { productId, quantity } = body;
        const orderQuantity = quantity || 1;

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        // Create the order in your database
        const order = await prisma.order.create({
            data: { productId: product.id, customerId: session.user.id }
        });

        // ACTION: Instead of fetching localhost, we run the function!
        try {
            const mpesaResult = await initiateSTKPush(
                "254703704389", // Your test phone
                product.price * orderQuantity,
                order.id
            );

            console.log("M-Pesa Triggered Successfully:", mpesaResult);

            return NextResponse.json({
                message: "STK Push Sent",
                redirectTo: `/paymentscreen?orderId=${order.id}`
            }, { status: 201 });

        } catch (mpesaErr: any) {
            console.error("MPESA_ERROR:", mpesaErr.message);
            return NextResponse.json({ error: "M-Pesa Service Down" }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: "Order Creation Failed" }, { status: 500 });
    }
}