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
        const { productId, quantity } = body;
        const orderQuantity = quantity || 1;

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const order = await prisma.order.create({
            data: { productId: product.id, customerId: session.user.id }
        });

        // 127.0.0.1 is more stable than 'localhost' for internal node fetches
        // IMPORTANT: Change 3000 if your terminal says a different port!
        const baseUrl = "http://127.0.0.1:3000";

        try {
            const mpesaRes = await fetch(`${baseUrl}/api/mpesa/stkpush`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: product.price * orderQuantity,
                    phoneNumber: "254703704389", // Your test number
                    orderId: order.id,
                }),
            });

            if (!mpesaRes.ok) throw new Error(`HTTP ${mpesaRes.status}`);

            return NextResponse.json({
                message: "Success",
                redirectTo: `/paymentscreen?orderId=${order.id}`
            }, { status: 201 });

        } catch (mpesaErr: any) {
            console.error("FETCH_ERROR:", mpesaErr.message);
            return NextResponse.json({
                error: `Gateway Error: ${mpesaErr.message}. Ensure baseUrl matches your running port.`
            }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}