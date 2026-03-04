"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ─── Retry Configuration ────────────────────────────────────────────
const RETRY_CONFIG = {
    // Config 1: Polling retry — how we check payment status
    polling: {
        initialIntervalMs: 3000,     // Start polling every 3 seconds
        maxIntervalMs: 10000,        // Back off to max 10 seconds
        backoffMultiplier: 1.3,      // Increase interval by 30% each poll
        maxAttempts: 40,             // Stop after 40 attempts (~2 min)
    },
    // Config 2: STK Push re-trigger — allow user to resend prompt
    stkRetry: {
        maxRetries: 2,               // Allow up to 2 re-sends
        cooldownMs: 15000,           // 15-second cooldown between retries
    },
};

type PaymentPhase = "waiting" | "success" | "failed" | "timeout";

function PaymentContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const router = useRouter();

    const [phase, setPhase] = useState<PaymentPhase>("waiting");
    const [statusText, setStatusText] = useState("STK Push sent! Check your phone for the M-Pesa prompt.");
    const [pollCount, setPollCount] = useState(0);
    const [stkRetryCount, setStkRetryCount] = useState(0);
    const [retryCooldown, setRetryCooldown] = useState(false);
    const [orderDetails, setOrderDetails] = useState<{
        product?: { name: string; price: number };
        mpesaReceipt?: string;
    } | null>(null);

    // ─── Polling with exponential backoff ───────────────────────────
    useEffect(() => {
        if (!orderId || phase !== "waiting") return;

        let currentInterval = RETRY_CONFIG.polling.initialIntervalMs;
        let attempts = 0;
        let timer: NodeJS.Timeout;

        const poll = async () => {
            try {
                attempts++;
                setPollCount(attempts);
                const response = await fetch(`/api/mpesa/status?orderId=${orderId}`);
                const data = await response.json();

                if (data.status === "COMPLETED" || data.status === "PAID") {
                    setPhase("success");
                    setStatusText("Payment confirmed!");
                    setOrderDetails({
                        product: data.product,
                        mpesaReceipt: data.mpesaReceipt,
                    });
                    return; // Stop polling
                } else if (data.status === "FAILED") {
                    setPhase("failed");
                    setStatusText("Payment was not completed.");
                    return; // Stop polling
                }
            } catch (error) {
                console.error("Poll error:", error);
            }

            // Check if we've exceeded max attempts
            if (attempts >= RETRY_CONFIG.polling.maxAttempts) {
                setPhase("timeout");
                setStatusText("Payment verification timed out. Your payment may still be processing.");
                return;
            }

            // Calculate next interval with backoff
            currentInterval = Math.min(
                currentInterval * RETRY_CONFIG.polling.backoffMultiplier,
                RETRY_CONFIG.polling.maxIntervalMs
            );

            timer = setTimeout(poll, currentInterval);
        };

        // Start first poll after initial interval
        timer = setTimeout(poll, currentInterval);
        return () => clearTimeout(timer);
    }, [orderId, phase]);

    // ─── STK Push Retry ─────────────────────────────────────────────
    const handleRetrySTK = useCallback(async () => {
        if (stkRetryCount >= RETRY_CONFIG.stkRetry.maxRetries || retryCooldown) return;

        setRetryCooldown(true);
        setStkRetryCount((prev) => prev + 1);
        setPhase("waiting");
        setStatusText("Resending M-Pesa prompt to your phone...");
        setPollCount(0);

        try {
            const res = await fetch("/api/mpesa/stkpush", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatusText("New prompt sent! Check your phone for the M-Pesa PIN request.");
            } else {
                setStatusText(data.error || "Failed to resend. Please try again later.");
                setPhase("failed");
            }
        } catch {
            setStatusText("Network error. Please check your connection.");
            setPhase("failed");
        }

        // Cooldown timer
        setTimeout(() => setRetryCooldown(false), RETRY_CONFIG.stkRetry.cooldownMs);
    }, [stkRetryCount, retryCooldown, orderId]);

    // ─── SUCCESS VIEW ───────────────────────────────────────────────
    if (phase === "success") {
        return (
            <div className="relative w-full max-w-lg mx-4">
                {/* Confetti-like decorative dots */}
                <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-green-500/10 blur-2xl animate-pulse" />
                <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />

                <div className="relative bg-neutral-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-green-500/20 text-center shadow-2xl shadow-green-500/5">
                    {/* Success Icon with Ring Animation */}
                    <div className="relative mx-auto mb-8 w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Payment Successful!</h1>
                    <p className="text-green-400 font-medium text-lg mb-6">Your transaction has been confirmed</p>

                    {/* Transaction Details Card */}
                    <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/10 text-left space-y-3">
                        {orderDetails?.product && (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Item</span>
                                    <span className="text-white font-medium">{orderDetails.product.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Amount Paid</span>
                                    <span className="text-green-400 font-bold text-lg">KSh {orderDetails.product.price.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        {orderDetails?.mpesaReceipt && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">M-Pesa Receipt</span>
                                <span className="text-white font-mono text-sm bg-white/10 px-3 py-1 rounded-lg">{orderDetails.mpesaReceipt}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Order ID</span>
                            <span className="text-gray-300 text-xs font-mono">{orderId?.slice(-12)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push("/")}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-base hover:from-green-400 hover:to-emerald-500 transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
                        >
                            Continue Shopping
                        </button>
                        <button
                            onClick={() => router.push("/profile")}
                            className="w-full py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm font-medium border border-white/10"
                        >
                            View My Orders
                        </button>
                    </div>

                    {/* Secure Badge */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Secured by M-Pesa • Safaricom
                    </div>
                </div>
            </div>
        );
    }

    // ─── WAITING / FAILED / TIMEOUT VIEW ────────────────────────────
    const isFailed = phase === "failed";
    const isTimeout = phase === "timeout";
    const canRetry = stkRetryCount < RETRY_CONFIG.stkRetry.maxRetries && !retryCooldown;

    return (
        <div className="relative w-full max-w-md mx-4">
            {/* Decorative bg glow */}
            {phase === "waiting" && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-green-500/10 blur-3xl animate-pulse" />
            )}

            <div className={`relative bg-neutral-900/80 backdrop-blur-xl p-8 rounded-3xl border text-center shadow-2xl ${isFailed ? "border-red-500/20 shadow-red-500/5" :
                    isTimeout ? "border-yellow-500/20 shadow-yellow-500/5" :
                        "border-white/10 shadow-green-500/5"
                }`}>
                {/* Icon */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isFailed ? "bg-red-500/20" :
                        isTimeout ? "bg-yellow-500/20" :
                            "bg-green-500/20"
                    }`}>
                    {isFailed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : isTimeout ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <>
                            {/* Phone icon with pulsing ring */}
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping" style={{ animationDuration: "2s" }} />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                    {isFailed ? "Payment Failed" : isTimeout ? "Verification Timeout" : "M-Pesa Payment"}
                </h1>
                <p className={`font-medium mb-1 ${isFailed ? "text-red-400" :
                        isTimeout ? "text-yellow-400" :
                            "text-green-400"
                    }`}>
                    {statusText}
                </p>

                {phase === "waiting" && (
                    <>
                        <p className="text-gray-500 text-sm mb-4">Enter your M-Pesa PIN on your phone to complete the payment.</p>
                        {/* Progress indicator */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-green-500 animate-bounce"
                                        style={{ animationDelay: `${i * 200}ms`, animationDuration: "1s" }}
                                    />
                                ))}
                            </div>
                            <span className="text-gray-600 text-xs">Checking payment status...</span>
                        </div>
                    </>
                )}

                {/* Order ID */}
                <div className="text-xs text-gray-600 mb-6 bg-white/5 rounded-xl py-2 px-4 inline-block">
                    Order: <span className="text-gray-400 font-mono">{orderId?.slice(-12)}</span>
                </div>

                {/* Retry Button (for failed/timeout) */}
                {(isFailed || isTimeout) && canRetry && (
                    <div className="mb-4">
                        <button
                            onClick={handleRetrySTK}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:-translate-y-0.5"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Resend M-Pesa Prompt ({RETRY_CONFIG.stkRetry.maxRetries - stkRetryCount} left)
                            </span>
                        </button>
                        <p className="text-xs text-gray-600 mt-2">
                            A new STK push will be sent to your phone
                        </p>
                    </div>
                )}

                {/* Cooldown indicator */}
                {(isFailed || isTimeout) && retryCooldown && (
                    <div className="mb-4 text-sm text-yellow-500/80 flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Please wait before retrying...
                    </div>
                )}

                {/* Max retries reached */}
                {(isFailed || isTimeout) && stkRetryCount >= RETRY_CONFIG.stkRetry.maxRetries && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        Maximum retries reached. Please start a new order or contact support.
                    </div>
                )}

                {/* Navigation */}
                <div className="space-y-2">
                    <button
                        onClick={() => router.push("/")}
                        className="w-full px-6 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm font-medium border border-white/10"
                    >
                        {phase === "waiting" ? "Return to Home" : "Back to Store"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <Suspense fallback={
                <div className="bg-neutral-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-green-500/30 border-t-green-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading payment gateway...</p>
                </div>
            }>
                <PaymentContent />
            </Suspense>
        </div>
    );
}