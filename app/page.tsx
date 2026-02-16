import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = 'force-dynamic';

export default async function Marketplace() {
  // We are defining your 6 products directly in the code here.
  // This bypasses the database and uses your Cloudinary links directly.
  const products = [
    {
      id: "1",
      name: "Product One",
      price: 99.99,
      description: "Description for your first amazing product.",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988143/Screenshot_2026-02-13_160332_p80mb1.png",
      seller: { email: "seller1@riftshop.com" },
      sellerId: "s1"
    },
    {
      id: "2",
      name: "Product Two",
      price: 149.50,
      description: "Description for your second amazing product.",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988154/Screenshot_2026-02-13_160416_bwtlp9.png",
      seller: { email: "seller2@riftshop.com" },
      sellerId: "s2"
    },
    {
      id: "3",
      name: "Product Three",
      price: 75.00,
      description: "Description for your third amazing product.",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988165/Screenshot_2026-02-13_160531_mifzlg.png",
      seller: { email: "seller3@riftshop.com" },
      sellerId: "s3"
    },
    {
      id: "4",
      name: "Product Four",
      price: 200.00,
      description: "Description for your fourth amazing product.",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988176/Screenshot_2026-02-13_160618_j4nwey.png",
      seller: { email: "seller4@riftshop.com" },
      sellerId: "s4"
    },
    {
      id: "5",
      name: "Product Five",
      price: 120.00,
      description: "Description for your fifth amazing product.",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988188/Screenshot_2026-02-13_160711_tvgjig.png",
      seller: { email: "seller5@riftshop.com" },
      sellerId: "s5"
    },
    {
      id: "6",
      name: "Product Six",
      price: 310.00,
      description: "Description for your sixth amazing product.",
      imageUrl: "https://res.cloudinary.com/dbr5o599o/image/upload/v1770988204/Screenshot_2026-02-13_160751_qrggex.png",
      seller: { email: "seller6@riftshop.com" },
      sellerId: "s6"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">Marketplace</h1>
          <p className="text-gray-300 text-xl">Your hardcoded products are now live below.</p>
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
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // This fixes the 'Image Not Available' by providing a fallback if the link is broken
                      e.currentTarget.src = "https://placehold.co/600x400?text=Image+Loading...";
                    }}
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