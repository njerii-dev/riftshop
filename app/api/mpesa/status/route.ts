import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                status: true,
                mpesaReceipt: true,
                createdAt: true,
                product: {
                    select: {
                        name: true,
                        price: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({
            status: order.status,
            mpesaReceipt: order.mpesaReceipt,
            product: order.product,
            createdAt: order.createdAt,
        });
    } catch (error: any) {
        console.error("MPESA_STATUS_ERROR:", error.message);
        return NextResponse.json(
            { error: "Could not fetch payment status" },
            { status: 500 }
        );
    }
}
