import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

// This tells Next.js this is a Server Component
export default async function ProductDescriptionPage({
    params
}: {
    params: { id: string }
}) {
    // We must await params in newer versions of Next.js
    const { id } = params;

    const product = await prisma.product.findUnique({
        where: { id: id },
        include: { seller: true }
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors mb-8 inline-block">
                    ← Back to Marketplace
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="aspect-square bg-neutral-900 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>No Image</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                        <p className="text-xl font-bold text-purple-400 mb-6">${product.price.toFixed(2)}</p>

                        <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
                            <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-3">Description</h3>
                            <p className="text-gray-300 leading-relaxed">{product.description}</p>
                        </div>

                        <AddToCartButton
                            productId={product.id}
                            productName={product.name}
                            price={product.price}
                            sellerId={product.sellerId}
                            sellerEmail={product.seller.email}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}