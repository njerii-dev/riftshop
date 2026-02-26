"use client";

import { useState } from "react";

export default function BuyButton({ productId, productName, price }: { productId: string; productName: string; price: number }) {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showPhoneInput, setShowPhoneInput] = useState(false);

    const handleBuy = async () => {
        if (!showPhoneInput) {
            setShowPhoneInput(true);
            return;
        }

        if (!phoneNumber.trim()) {
            alert("Please enter your M-Pesa phone number.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, productName, price, phoneNumber: phoneNumber.trim() }),
            });

            const data = await response.json();

            if (response.ok && data.redirectTo) {
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
        <div className="flex flex-col gap-2">
            {showPhoneInput && (
                <input
                    type="tel"
                    placeholder="M-Pesa number e.g. 0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                />
            )}
            <button
                onClick={handleBuy}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
                {isLoading ? "Redirecting to M-Pesa..." : "Pay with M-Pesa"}
            </button>
        </div>
    );
}