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
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleCheckout = async () => {
        if (status !== "authenticated") {
            router.push("/login");
            return;
        }

        setIsCheckingOut(true);
        setCheckoutError(null);

        if (!phoneNumber.trim()) {
            setCheckoutError("Please enter your M-Pesa phone number.");
            setIsCheckingOut(false);
            return;
        }

        try {
            // Process each cart item as an order
            const results = await Promise.all(
                items.map(async (item) => {
                    const res = await fetch("/api/order", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            productId: item.productId,
                            quantity: item.quantity,
                            phoneNumber: phoneNumber.trim(),
                        }),
                    });

                    const data = await res.json();
                    return { ok: res.ok, data, itemName: item.name };
                })
            );

            const failed = results.filter((r) => !r.ok);

            if (failed.length === 0) {
                // SUCCESS: Find the redirect URL from the first successful order
                const redirectUrl = results[0]?.data?.redirectTo;

                if (redirectUrl) {
                    console.log("🎯 Redirecting to:", redirectUrl);
                    clearCart();
                    // This forces the browser to jump to the payment screen immediately
                    window.location.href = redirectUrl;
                } else {
                    // Fallback if the API response is missing the link
                    setCheckoutSuccess(true);
                    clearCart();
                    setTimeout(() => router.push("/"), 2000);
                }
            } else if (failed.length < results.length) {
                // Partial failure
                const failedNames = failed.map((f) => f.itemName).join(", ");
                setCheckoutError(
                    `Some orders failed to process: ${failedNames}. Please try again.`
                );
            } else {
                // All failed
                const errorMsg =
                    failed[0]?.data?.error || "Failed to process your order.";
                setCheckoutError(errorMsg);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setCheckoutError(
                "Something went wrong. Please check your connection and try again."
            );
        } finally {
            setIsCheckingOut(false);
        }
    };

    // This is the "Success State" UI that shows for a split second before redirecting
    if (checkoutSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-green-500"
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
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Order Prepared!
                    </h1>
                    <p className="text-foreground-muted mb-6">
                        Redirecting you to the M-Pesa payment screen...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                        Shopping Cart
                    </h1>
                    <p className="text-foreground-muted">
                        {items.length} {items.length === 1 ? "item" : "items"} in your cart
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16 text-purple-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-foreground-muted mb-8 max-w-md mx-auto">
                            Looks like you haven&apos;t added any products yet. Explore our
                            marketplace to find amazing items!
                        </p>
                        <Link href="/" className="btn-primary py-4 px-8">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-background-secondary border border-border group hover:border-purple-500/30 transition-all duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500/50"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                            />
                                        </svg>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-foreground-muted mb-2 truncate">
                                            Sold by {item.sellerEmail}
                                        </p>
                                        <p className="text-xl font-bold gradient-text">
                                            ${item.price.toFixed(2)}
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.productId, item.quantity - 1)
                                                    }
                                                    className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:border-purple-500/50 transition-colors"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-foreground"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M20 12H4"
                                                        />
                                                    </svg>
                                                </button>
                                                <span className="w-10 text-center font-semibold text-foreground text-lg">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.productId, item.quantity + 1)
                                                    }
                                                    className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:border-purple-500/50 transition-colors"
                                                    aria-label="Increase quantity"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-foreground"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 4v16m8-8H4"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                className="flex items-center gap-2 text-foreground-muted hover:text-red-500 transition-colors text-sm"
                                            >
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
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Item Total */}
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm text-foreground-muted mb-1">
                                            Item Total
                                        </p>
                                        <p className="text-xl font-bold text-foreground">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-background-secondary border border-border rounded-2xl p-6">
                                <h2 className="text-xl font-bold text-foreground mb-6">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-foreground-muted">
                                        <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                                        <span>${getTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-foreground-muted">
                                        <span>Shipping</span>
                                        <span className="text-green-500">Free</span>
                                    </div>
                                    <div className="flex justify-between text-foreground-muted">
                                        <span>Tax</span>
                                        <span>Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-foreground">
                                            Total
                                        </span>
                                        <span className="text-2xl font-bold gradient-text">
                                            ${getTotal().toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {checkoutError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                                        {checkoutError}
                                    </div>
                                )}

                                {/* M-Pesa Phone Number Input */}
                                <div className="mb-4">
                                    <label htmlFor="mpesa-phone" className="block text-sm font-medium text-foreground-muted mb-2">
                                        M-Pesa Phone Number
                                    </label>
                                    <input
                                        id="mpesa-phone"
                                        type="tel"
                                        placeholder="e.g. 0712345678"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                    <p className="text-xs text-foreground-muted mt-1">
                                        Enter the number registered with M-Pesa
                                    </p>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCheckingOut ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg
                                                className="animate-spin h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : status === "authenticated" ? (
                                        "Place Order"
                                    ) : (
                                        "Sign in to Checkout"
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        if (confirm("Are you sure you want to clear your cart?")) {
                                            clearCart();
                                        }
                                    }}
                                    className="w-full mt-4 py-3 rounded-xl border border-border text-foreground-muted hover:text-red-500 hover:border-red-500/50 transition-colors text-sm font-medium"
                                >
                                    Clear Cart
                                </button>

                                {/* Secure Checkout Badge */}
                                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-foreground-muted">
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
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    Secure Checkout
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}