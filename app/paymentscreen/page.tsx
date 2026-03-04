"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const router = useRouter();
    const [status, setStatus] = useState("STK Push sent! Check your phone for the M-Pesa prompt.");
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/check-payment?orderId=${orderId}`);
                const data = await response.json();

                // Match this string to exactly what your DB returns
                if (data.status === "COMPLETED" || data.status === "PAID") {
                    setStatus("Payment made successfully!");
                    setIsPaid(true);
                    clearInterval(pollInterval); // This works now!
                }
            } catch (error) {
                console.error("Error checking payment:", error);
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [orderId]);

    return (
        <div className="bg-neutral-900 p-8 rounded-3xl border border-white/10 text-center max-w-md w-full">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isPaid ? 'bg-green-500' : 'bg-green-500/20'}`}>
                {isPaid ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                )}
            </div>

            <h1 className="text-2xl font-bold mb-4">
                {isPaid ? "Success!" : "M-Pesa Payment"}
            </h1>
            <p className={`${isPaid ? "text-green-400" : "text-gray-400"} mb-2 font-medium`}>
                {status}
            </p>
            {!isPaid && (
                <p className="text-gray-500 text-sm mb-6">Enter your M-Pesa PIN on your phone to complete the payment.</p>
            )}

            <div className="text-xs text-gray-500 mb-6">Order ID: {orderId}</div>

            <button
                onClick={() => router.push("/")}
                className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
            >
                {isPaid ? "Go to Dashboard" : "Return to Home"}
            </button>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <Suspense fallback={<div>Loading payment gateway...</div>}>
                <PaymentContent />
            </Suspense>
        </div>
    );
}