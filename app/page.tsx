import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

// Force dynamic rendering - this page needs database access at runtime
export const dynamic = 'force-dynamic';

export default async function Marketplace() {
  // Fetch products from database
  const products = await prisma.product.findMany({
    include: {
      seller: true,
    },
    orderBy: {
      id: 'desc'
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-slide-up">
            <span className="badge badge-primary mb-6 inline-block">
              ✨ The Future of Shopping
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Unique Products</span> from Sellers Worldwide
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join our thriving marketplace where creativity meets commerce.
              Find one-of-a-kind items or start selling your own creations today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#products" className="btn-primary text-lg px-8 py-4">
                Explore Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              <Link href="/sell" className="btn-secondary text-lg px-8 py-4 text-white border-white/30 hover:border-white hover:text-white">
                Start Selling
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { value: "10K+", label: "Products