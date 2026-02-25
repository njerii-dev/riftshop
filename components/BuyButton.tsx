"use client";

import { useState } from "react";

interface BuyButtonProps {
    productId: string;
    productName: string;
    price: number;
}

export default function BuyButton({ productId, productName, price }: BuyButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleBuy = async () => {
        setIsLoading(true);
        console.log("🚀 Initializing order for:", productName);

        try {
            const response = await fetch("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId,
                    productName,
                    price,
                    quantity: 1
                }),
            });

            const data = await response.json();
            console.log("📦 API Response:", data);

            if (response.ok) {
                // Check if the backend provided the redirect URL
                if (data.redirectTo) {
                    console.log("🎯 Link found! Redirecting to payment screen...");
                    // Using window.location.href for a guaranteed redirect
                    window.location.href = data.redirectTo;
                } else {
                    console.error("❌ Redirect link missing from API response");
                    alert("Order saved, but couldn't find the payment screen link.");
                }
            } else {
                alert(data.error || "Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("🔥 Network Error:", error);
            alert("Something went wrong. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleBuy}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Buy Now
                </>
            )}
        </button>
    );
}