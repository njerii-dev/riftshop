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
        console.log(`🔍 Looking up product with ID: "${productId}"`);
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            console.error(`❌ Product not found for ID: "${productId}"`);
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // 4. Create order(s) in the database
        //    Since the Order model doesn't have a quantity field,
        //    we create one order per unit, or you can create a single order.
        //    For simplicity, create a single order record.
        const order = await prisma.order.create({
            data: {
                productId: product.id,
                customerId: session.user.id,
            },
        });

        console.log(
            `🛒 Order placed! User: ${session.user.email}, Product: ${product.name} (x${orderQuantity}), Order ID: ${order.id}`
        );

        return NextResponse.json(
            {
                message: "Order placed successfully",
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
