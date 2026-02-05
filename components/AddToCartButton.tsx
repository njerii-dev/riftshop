"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

interface AddToCartButtonProps {
    productId: string;
    productName: string;
    price: number;
    sellerId: string;
    sellerEmail: string;
}

export default function AddToCartButton({
    productId,
    productName,
    price,
    sellerId,
    sellerEmail,
}: AddToCartButtonProps) {
    const { addItem, openCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToCart = () => {
        // Prevent multiple rapid clicks
        if (isLoading || isAdded) return;

        try {
            setIsLoading(true);

            addItem({
                productId,
                name: productName,
                price,
                sellerId,
                sellerEmail,
            });

            setIsAdded(true);

            // Open cart sidebar after adding item
            setTimeout(() => openCart(), 300);

            // Reset button state after 1.5 seconds
            setTimeout(() => {
                setIsAdded(false);
                setIsLoading(false);
            }, 1500);
        } catch (error) {
            console.error("Error adding item to cart:", error);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={isAdded || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg ${isAdded
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white hover:shadow-purple-500/25"
                }`}
        >
            {isAdded ? (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    Added!
                </>
            ) : (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    Add to Cart
                </>
            )}
        </button>
    );
}
