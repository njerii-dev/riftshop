"use client";

import { useCart } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const handleCheckout = async () => {
        if (status !== "authenticated") {
            router.push("/login");
            return;
        }

        setIsCheckingOut(true);
        setCheckoutError(null);

        try {
            const results = await Promise.all(
                items.map(async (item) => {
                    // FIX: Ensure we use item.productId, not item.id
                    const res = await fetch("/api/order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            productId: item.productId,
                            quantity: item.quantity,
                        }),
                    });

                    const data = await res.json();
                    return { ok: res.ok, data, itemName: item.name };
                })
            );

            const failed = results.filter((r) => !r.ok);

            if (failed.length === 0) {
                clearCart();
                router.push("/orders"); // Or your success page
            } else {
                setCheckoutError(failed[0]?.data?.error || "Order processing failed.");
            }
        } catch (error) {
            setCheckoutError("Connection error. Please try again.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (items.length === 0) return <div>Your cart is empty</div>;

    return (
        <div className="max-w-5xl mx-auto p-4">
            {items.map((item) => (
                // FIX: Used item.productId for the key and functions
                <div key={item.productId} className="flex justify-between border-b p-4">
                    <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p>${item.price}</p>
                        <div className="flex gap-2">
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                        </div>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-red-500">Remove</button>
                </div>
            ))}
            <div className="mt-6">
                <p className="text-xl font-bold">Total: ${getTotal().toFixed(2)}</p>
                <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="btn-primary w-full py-3 mt-4"
                >
                    {isCheckingOut ? "Processing..." : "Place Order"}
                </button>
                {checkoutError && <p className="text-red-500 mt-2">{checkoutError}</p>}
            </div>
        </div>
    );
}