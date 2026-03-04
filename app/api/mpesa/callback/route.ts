import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const callback = body.Body.stkCallback;
        const { CheckoutRequestID, ResultCode, ResultDesc } = callback;

        console.log(`[M-Pesa Callback] ID: ${CheckoutRequestID}, Code: ${ResultCode}, Desc: ${ResultDesc}`);

        // Extract callback metadata (receipt, amount, phone) from successful transactions
        let mpesaReceiptNumber: string | null = null;
        let paidAmount: number | null = null;
        let phoneNumber: string | null = null;
        let transactionDate: string | null = null;

        if (ResultCode === 0 && callback.CallbackMetadata?.Item) {
            for (const item of callback.CallbackMetadata.Item) {
                switch (item.Name) {
                    case "MpesaReceiptNumber":
                        mpesaReceiptNumber = item.Value;
                        break;
                    case "Amount":
                        paidAmount = item.Value;
                        break;
                    case "PhoneNumber":
                        phoneNumber = String(item.Value);
                        break;
                    case "TransactionDate":
                        transactionDate = String(item.Value);
                        break;
                }
            }
        }

        if (ResultCode === 0) {
            // Update order status and save receipt
            await prisma.order.update({
                where: { checkoutRequestId: CheckoutRequestID },
                data: {
                    status: "COMPLETED",
                    mpesaReceipt: mpesaReceiptNumber,
                },
            });

            // Save detailed payment record to mpesa_payments table
            await prisma.mpesa_payments.upsert({
                where: { checkout_request_id: CheckoutRequestID },
                update: {
                    status: "COMPLETED",
                    mpesa_receipt: mpesaReceiptNumber,
                    amount: paidAmount,
                    phone_number: phoneNumber,
                },
                create: {
                    checkout_request_id: CheckoutRequestID,
                    status: "COMPLETED",
                    mpesa_receipt: mpesaReceiptNumber,
                    amount: paidAmount,
                    phone_number: phoneNumber,
                },
            });

            console.log(`[M-Pesa] Payment COMPLETED. Receipt: ${mpesaReceiptNumber}`);
            return NextResponse.json({ message: "Success received" });
        } else {
            // Update order as failed
            await prisma.order.update({
                where: { checkoutRequestId: CheckoutRequestID },
                data: { status: "FAILED" },
            });

            // Record the failure in mpesa_payments
            await prisma.mpesa_payments.upsert({
                where: { checkout_request_id: CheckoutRequestID },
                update: {
                    status: "FAILED",
                },
                create: {
                    checkout_request_id: CheckoutRequestID,
                    status: "FAILED",
                },
            });

            console.log(`[M-Pesa] Payment FAILED. Reason: ${ResultDesc}`);
            return NextResponse.json({ message: "Failure recorded" });
        }
    } catch (error) {
        console.error("Callback Listener Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}