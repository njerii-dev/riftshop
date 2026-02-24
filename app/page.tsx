import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Marketplace() {
  // Fetch products from the database with their seller info
  const products = await prisma.product.findMany({
    include: {
      seller: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">Marketplace</h1>
          <p className="text-gray-300 text-xl">Browse our latest products below.</p>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <article key={product.id} className="product-card bg-neutral-900 rounded-3xl overflow-hidden shadow-xl border border-white/5 p-4">
                {/* Image Container */}
                <div className="relative w-full h-48 bg-black rounded-2xl mb-4 overflow-hidden border border-white/10">
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-2">
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-cyan-400">${product.price.toFixed(2)}</span>
                    <AddToCartButton
                      productId={product.id}
                      productName={product.name}
                      price={product.price}
                      sellerId={product.sellerId}
                      sellerEmail={product.seller.email}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}