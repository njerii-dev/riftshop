"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentScreen() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [status, setStatus] = useState("Initiating payment...");

    useEffect(() => {
        const triggerMpesa = async () => {
            try {
                const response = await fetch("/api/mpesa/stkpush", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: orderId,
                        phoneNumber: "2547XXXXXXXX", // In a real app, get this from the user's profile
                        amount: 1, // Testing with 1 shilling
                    }),
                });

                const data = await response.json();
                if (data.ResponseCode === "0") {
                    setStatus("Check your phone for the M-Pesa PIN prompt!");
                } else {
                    setStatus("M-Pesa failed to trigger. Please try again.");
                }
            } catch (error) {
                setStatus("Error reaching payment gateway.");
            }
        };

        if (orderId) triggerMpesa();
    }, [orderId]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="bg-neutral-900 p-8 rounded-3xl border border-white/10 text-center max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">Complete Your Payment</h1>
                <div className="animate-pulse mb-6">
                    {/* You can put an M-Pesa logo here */}
                    <div className="h-16 w-16 bg-green-500 rounded-full mx-auto flex items-center justify-center font-bold text-xs">M-PESA</div>
                </div>
                <p className="text-gray-400 mb-8">{status}</p>
                <button
                    onClick={() => window.location.href = "/marketplace"}
                    className="text-sm text-cyan-400 underline"
                >
                    Return to Marketplace
                </button>
            </div>
        </div>
    );
}