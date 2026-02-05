"use client";

import { registerUser } from "@/app/actions/auth";
import Link from "next/link";
import { useActionState } from "react";
import { useEffect, useState } from "react";

// Wrapper function that returns error state instead of throwing
async function registerAction(prevState: { error: string | null }, formData: FormData) {
  try {
    await registerUser(formData);
    return { error: null };
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a redirect (Next.js throws NEXT_REDIRECT)
      if (error.message === "NEXT_REDIRECT") {
        throw error;
      }
      return { error: error.message };
    }
    return { error: "Something went wrong" };
  }
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, { error: null });
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (state.error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
              R
            </span>
            <span className="text-2xl font-bold text-white">Riftshop</span>
          </Link>
        </div>

        {/* Register Card */}
        <div className="glass rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join the marketplace revolution</p>
          </div>

          {/* Error Message */}
          {showError && state.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3 animate-slide-up">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-300 text-sm">{state.error}</span>
              <button
                onClick={() => setShowError(false)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="input bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="input bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
              />
              <p className="text-xs text-gray-400 mt-2">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative cursor-pointer">
                  <input type="radio" name="role" value="CUSTOMER" defaultChecked className="peer sr-only" />
                  <div className="p-4 rounded-xl bg-white/10 border-2 border-white/20 peer-checked:border-purple-500 peer-checked:bg-purple-500/20 transition-all">
                    <div className="flex flex-col items-center text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="text-white font-medium">Shop</span>
                      <span className="text-xs text-gray-400">Buy products</span>
                    </div>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input type="radio" name="role" value="SELLER" className="peer sr-only" />
                  <div className="p-4 rounded-xl bg-white/10 border-2 border-white/20 peer-checked:border-cyan-500 peer-checked:bg-cyan-500/20 transition-all">
                    <div className="flex flex-col items-center text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-white font-medium">Sell</span>
                      <span className="text-xs text-gray-400">List products</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                I agree to the{" "}
                <Link href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
          <p className="text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}