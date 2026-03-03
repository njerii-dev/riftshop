import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDescriptionPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // 1. Fetch the product
    const product = await prisma.product.findUnique({
        where: { id: id },
        include: { seller: true }
    });

    // 2. MANUAL CHECK: Instead of using 'notFound()', we show a message
    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Oops! Product not found.</h1>
                    <Link href="/" className="text-purple-400 hover:underline">Return to Marketplace</Link>
                </div>
            </div>
        );
    }

    // 3. If the product IS found, show the page
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="text-purple-400 mb-8 inline-block">← Back</Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="aspect-square bg-neutral-900 rounded-2xl flex items-center justify-center border border-white/10">
                        <span className="text-gray-600">No Image Available</span>
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                        <p className="text-2xl font-bold text-purple-400 mb-6">KSh {product.price.toFixed(2)}</p>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Details</h3>
                            <p className="text-gray-300">{product.description}</p>
                        </div>

                        <AddToCartButton
                            productId={product.id}
                            productName={product.name}
                            price={Number(product.price)}
                            sellerId={product.sellerId}
                            sellerEmail={product.seller.email}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}