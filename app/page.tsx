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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              { value: "10K+", label: "Products" },
              { value: "5K+", label: "Sellers" },
              { value: "50K+", label: "Customers" },
              { value: "99%", label: "Satisfaction" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
              Handpicked selection of our finest items from verified sellers
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Products Yet</h3>
              <p className="text-foreground-muted mb-6">Be the first to list a product on Riftshop!</p>
              <Link href="/sell" className="btn-primary">
                List Your First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <article
                  key={product.id}
                  className="product-card animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image Placeholder */}
                  <div className="product-image">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-success text-xs">New</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-foreground-muted text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold gradient-text">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <AddToCartButton
                        productId={product.id}
                        productName={product.name}
                        price={product.price}
                        sellerId={product.sellerId}
                        sellerEmail={product.seller.email}
                      />
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        {product.seller.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-foreground-muted truncate">
                        {product.seller.email}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-cyan-600 p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start Selling?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of sellers who are already earning on Riftshop.
                List your first product in minutes.
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 bg-white text-purple-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors">
                Create Seller Account
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-secondary border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                R
              </span>
              <span className="font-bold text-foreground">Riftshop</span>
            </div>
            <p className="text-foreground-muted text-sm">
              © 2026 Riftshop. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/profile" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
                Terms
              </Link>
              <Link href="/profile" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
                Privacy
              </Link>
              <Link href="/profile" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}