import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        // 1. Parse the data sent from your BuyButton
        const body = await request.json();
        const { productId, productName, price } = body;

        // 2. Log it to your terminal so you can see it's working
        console.log("🛒 RiftShop Order Received!");
        console.log(`Product: ${productName} (ID: ${productId}) - Price: $${price}`);

        // TODO: Later, you can add code here to save this to your database

        // 3. Send a "Success" message back to the button
        return NextResponse.json(
            { message: "Order processed successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to process order" },
            { status: 500 }
        );
    }
}