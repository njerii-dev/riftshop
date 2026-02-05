import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // 1. Initialize the connection to Neon
        const sql = neon(process.env.DATABASE_URL);

        // 2. Capture the data sent by your BuyButton component
        const body = await request.json();
        const { productId, productName, price } = body;

        // 3. Insert the data into your existing 'orders' table
        // IMPORTANT: Make sure these column names match your Neon table headers
        await sql`
            INSERT INTO orders (product_id, product_name, price)
            VALUES (${productId}, ${productName}, ${price})
        `;

        // 4. Send a success response back to the button
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json(
            { error: "Failed to save order to database" },
            { status: 500 }
        );
    }
}