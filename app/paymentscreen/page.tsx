"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// 1. Create a sub-component for the logic
function PaymentContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const router = useRouter();
    const [status] = useState("STK Push sent! Check your phone for the M-Pesa prompt.");

    return (
        <div className="bg-neutral-900 p-8 rounded-3xl border border-white/10 text-center max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">M-Pesa Payment</h1>
            <p className="text-gray-400 mb-2">{status}</p>
            <p className="text-gray-500 text-sm mb-6">Enter your M-Pesa PIN on your phone to complete the payment.</p>
            <div className="text-xs text-gray-500 mb-6">Order ID: {orderId}</div>
            <button
                onClick={() => router.push("/")}
                className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
            >
                Return to Home
            </button>
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