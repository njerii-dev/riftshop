"use client";

import { useCart } from "@/lib/cart-context";

export default function CartIcon() {
    const { toggleCart, getItemCount } = useCart();
    const itemCount = getItemCount();

    return (
        <button
            onClick={toggleCart}
            className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
            aria-label={`Shopping cart with ${itemCount} items`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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

            {/* Item Count Badge */}
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold flex items-center justify-center animate-scale-in">
                    {itemCount > 99 ? "99+" : itemCount}
                </span>
            )}

            <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          70% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
        </button>
    );
}
