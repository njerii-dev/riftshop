"use client";

import { useState } from "react";

export default function BuyButton({ productId, productName, price }: { productId: string; productName: string; price: number }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleBuy = async () => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, productName, price }),
            });

            const data = await response.json();

            // 1. Check if the response is actually okay
            if (response.ok && data.redirectTo) {
                // 2. FORCE the browser to change URL immediately
                window.location.href = data.redirectTo;
            } else {
                alert("Backend error: " + (data.error || "No redirect path found"));
            }
        } catch (error) {
            alert("Network error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleBuy}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
        >
            {isLoading ? "Redirecting to M-Pesa..." : "Pay with M-Pesa"}
        </button>
    );
}