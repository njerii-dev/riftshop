import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        // 1. Check if user is authenticated
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Please login to place an order" },
                { status: 401 }
            );
        }

        // 2. Get the data sent from the "Buy" button
        const body = await request.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        // 3. Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // 4. Create the order
        const order = await prisma.order.create({
            data: {
                productId: productId,
                customerId: session.user.id,
            },
            include: {
                product: true,
            },
        });

        return NextResponse.json(
            {
                message: "Order placed successfully!",
                order: {
                    id: order.id,
                    productName: order.product.name,
                    price: order.product.price,
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Order error:", error);
        return NextResponse.json(
            { error: "Failed to place order. Please try again." },
            { status: 500 }
        );
    }
}