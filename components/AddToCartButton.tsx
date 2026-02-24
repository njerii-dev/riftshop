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
        if (isLoading || isAdded) return;

        try {
            setIsLoading(true);
            // Standardized: Ensure we use 'productId' as the key
            addItem({
                productId,
                name: productName,
                price,
                sellerId,
                sellerEmail,
            });

            setIsAdded(true);
            setTimeout(() => openCart(), 300);
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
                    : "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                }`}
        >
            {isAdded ? "Added!" : "Add to Cart"}
        </button>
    );
}