import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = 'force-dynamic';

export default async function Marketplace() {
  // These IDs (p1, p2, etc.) now match your Seed file exactly!
  const products = [
    {
      id: "p1",
      name: "Iphone 13 pro",
      price: 1,
      description: "Blue 6.1 inch iphone 13 with Aluminum edge",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988143/Screenshot_2026-02-13_160332_p80mb1.png",
      seller: { email: "seller@riftshop.com" },
      sellerId: "s1"
    },
    {
      id: "p2",
      name: "Samsung Tv",
      price: 1,
      description: "42 inch Samsung TV",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988154/Screenshot_2026-02-13_160416_bwtlp9.png",
      seller: { email: "seller@riftshop.com" },
      sellerId: "s1"
    },
    {
      id: "p3",
      name: "Think pad lenovo",
      price: 1,
      description: "Black think pad with 4gb ram",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988165/Screenshot_2026-02-13_160531_mifzlg.png",
      seller: { email: "seller@riftshop.com" },
      sellerId: "s1"
    },
    {
      id: "p4",
      name: "Vintage Camera",
      price: 1,
      description: "A grey vintage camera with 6gb storage",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988176/Screenshot_2026-02-13_160618_j4nwey.png",
      seller: { email: "seller@riftshop.com" },
      sellerId: "s1"
    },
    {
      id: "p5",
      name: "Handmade leather wallet",
      price: 1,
      description: "Brown handmade leather wallet with 7 card slots",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988188/Screenshot_2026-02-13_160711_tvgjig.png",
      seller: { email: "seller@riftshop.com" },
      sellerId: "s1"
    },
    {
      id: "p6",
      name: "Wireless earpods",
      price: 1,
      description: "Black wireless earpods with 24 hour battery life",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988204/Screenshot_2026-02-13_160751_qrggex.png",
      seller: { email: "seller@riftshop.com" },
      sellerId: "s1"
    }
  ];

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <article key={product.id} className="product-card bg-neutral-900 rounded-3xl overflow-hidden shadow-xl border border-white/5 p-4">
                <div className="relative w-full h-48 bg-black rounded-2xl mb-4 overflow-hidden border border-white/10">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-2">
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-cyan-400">KSh {product.price.toFixed(2)}</span>
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