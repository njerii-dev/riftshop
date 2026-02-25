"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// 1. Create a sub-component for the logic
function PaymentContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [status, setStatus] = useState("Waiting for M-Pesa prompt...");

    useEffect(() => {
        const triggerMpesa = async () => {
            try {
                const response = await fetch("/api/mpesa/stkpush", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: orderId,
                        phoneNumber: "2547XXXXXXXX", // Your test number
                        amount: 1,
                    }),
                });
                const data = await response.json();
                if (data.ResponseCode === "0") {
                    setStatus("Prompt sent! Please enter your PIN on your phone.");
                } else {
                    setStatus("M-Pesa error: " + (data.CustomerMessage || "Failed"));
                }
            } catch (err) {
                setStatus("Could not reach the payment server.");
            }
        };

        if (orderId) triggerMpesa();
    }, [orderId]);

    return (
        <div className="bg-neutral-900 p-8 rounded-3xl border border-white/10 text-center max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4">M-Pesa Payment</h1>
            <p className="text-gray-400 mb-4">{status}</p>
            <div className="text-xs text-gray-500">Order ID: {orderId}</div>
        </div>
    );
}

// 2. The main Page component wrapped in Suspense
export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <Suspense fallback={<div>Loading payment gateway...</div>}>
                <PaymentContent />
            </Suspense>
        </div>
    );
}