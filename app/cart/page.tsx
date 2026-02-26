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
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const handleCheckout = async () => {
        // 1. Check Authentication
        if (status !== "authenticated") {
            router.push("/login");
            return;
        }

        // 2. Prevent empty checkout
        if (items.length === 0) {
            setCheckoutError("Your cart is empty.");
            return;
        }

        setIsCheckingOut(true);
        setCheckoutError(null);
        console.log("🚀 Starting checkout process...");

        try {
            // Process orders. We use the first item to trigger the M-Pesa STK push
            // If you have multiple items, you might want to modify your API to handle a whole cart.
            // For now, we process the first item to ensure the M-Pesa logic triggers.

            const item = items[0];
            console.log(`📡 Sending request to API for: ${item.name}`);

            const res = await fetch("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: item.productId,
                    quantity: item.quantity,
                }),
            });

            const data = await res.json();
            console.log("📩 Server Response:", data);

            if (!res.ok) {
                // This catches the "Internal Crash" and shows the REAL reason
                throw new Error(data.details || data.error || "Server rejected the order");
            }

            // SUCCESS: Redirect to M-Pesa
            if (data.redirectTo) {
                console.log("🎯 Redirecting to M-Pesa Checkout...");
                clearCart();
                window.location.href = data.redirectTo;
            } else {
                // Fallback for non-Mpesa or standard success
                setCheckoutSuccess(true);
                clearCart();
                setTimeout(() => router.push("/"), 2000);
            }

        } catch (error: any) {
            console.error("❌ Checkout Error:", error.message);
            // Display the specific error (e.g., "M-Pesa Authentication Failed")
            setCheckoutError(`Checkout Failed: ${error.message}`);
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (checkoutSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Order Prepared!</h1>
                    <p className="text-foreground-muted mb-6">Redirecting you to the M-Pesa payment screen...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Shopping Cart</h1>
                    <p className="text-foreground-muted">{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
                        <Link href="/" className="btn-primary py-4 px-8 mt-4 inline-block">Browse Products</Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-6 rounded-2xl bg-background-secondary border border-border">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">{item.name}</h3>
                                        <p className="text-xl font-bold gradient-text">${item.price.toFixed(2)}</p>
                                        <div className="flex items-center gap-4 mt-4">
                                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 border rounded">-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 border rounded">+</button>
                                            <button onClick={() => removeItem(item.productId)} className="text-red-500 ml-4">Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-background-secondary border border-border rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                                <div className="flex justify-between mb-4">
                                    <span>Total</span>
                                    <span className="text-2xl font-bold">${getTotal().toFixed(2)}</span>
                                </div>

                                {checkoutError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                                        ⚠️ {checkoutError}
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full btn-primary py-4 text-lg disabled:opacity-50"
                                >
                                    {isCheckingOut ? "Processing..." : status === "authenticated" ? "Place Order" : "Sign in to Checkout"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}