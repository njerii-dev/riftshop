// app/api/mpesa/stkpush/route.ts
import { NextResponse } from 'next/server';
import { initiateSTKPush } from '@/lib/mpesa-service';

export async function POST(req: Request) {
    try {
        const { phoneNumber, amount, orderId } = await req.json();
        const result = await initiateSTKPush(phoneNumber, amount, orderId || "test");
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}