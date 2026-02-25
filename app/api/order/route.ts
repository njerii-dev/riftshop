import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await auth();
        const body = await request.json();
        const { productId } = body;

        // 1. Check if we have the product
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        // 2. Create Order
        const order = await prisma.order.create({
            data: { productId: product.id, customerId: session?.user?.id || "guest" }
        });

        // 3. THE TRIGGER (With better error reporting)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        try {
            const mpesaResponse = await fetch(`${baseUrl}/api/mpesa/stkpush`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: product.price,
                    phoneNumber: "254703704389", // Use your real number
                    orderId: order.id,
                }),
            });

            const result = await mpesaResponse.json();
            return NextResponse.json({ message: "Order placed", mpesa: result });

        } catch (fetchError: any) {
            // This happens if the URL is wrong or the file is missing
            console.error("FETCH_ERROR:", fetchError.message);
            return NextResponse.json({
                error: "The order was saved, but the M-Pesa route could not be reached.",
                reason: fetchError.message
            }, { status: 500 });
        }

    } catch (outerError: any) {
        console.error("MAIN_ROUTE_CRASH:", outerError);
        return NextResponse.json({ error: "Internal Server Error", details: outerError.message }, { status: 500 });
    }
}