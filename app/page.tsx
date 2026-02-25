import AddToCartButton from "@/components/AddToCartButton";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Marketplace() {
  // Fetch products directly from the database so IDs always match
  const products = await prisma.product.findMany({
    include: {
      seller: {
        select: { email: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">Marketplace</h1>
          <p className="text-gray-300 text-xl">Database-synced products are now live below.</p>
        </div>
      </section>

      <section id="products" className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <article key={product.id} className="product-card bg-neutral-900 rounded-3xl overflow-hidden shadow-xl border border-white/5 p-4">
                  <div className="relative w-full h-48 bg-black rounded-2xl mb-4 overflow-hidden border border-white/10">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
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
          )}
        </div>
      </section>
    </div>
  );
}