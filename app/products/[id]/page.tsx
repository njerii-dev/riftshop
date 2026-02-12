import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

// Force dynamic rendering - this page needs database access at runtime
export const dynamic = "force-dynamic";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            seller: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="bg-background-secondary border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-2 text-sm text-foreground-muted">
                        <Link
                            href="/"
                            className="hover:text-purple-400 transition-colors"
                        >
                            Home
                        </Link>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                        <Link
                            href="/#products"
                            className="hover:text-purple-400 transition-colors"
                        >
                            Products
                        </Link>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                        <span className="text-foreground font-medium truncate max-w-[200px]">
                            {product.name}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Product Detail */}
            <section className="py-12 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
                        {/* Product Image */}
                        <div className="product-image rounded-2xl aspect-square max-h-[500px]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-24 w-24 text-white/50"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col justify-center">
                            <span className="badge badge-success text-xs mb-4 w-fit">
                                In Stock
                            </span>

                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                                {product.name}
                            </h1>

                            <p className="text-foreground-muted text-lg mb-8 leading-relaxed">
                                {product.description}
                            </p>

                            <div className="mb-8">
                                <span className="text-4xl font-bold gradient-text">
                                    ${product.price.toFixed(2)}
                                </span>
                            </div>

                            {/* Seller Info */}
                            <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-background-secondary border border-border">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                                    {product.seller.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm text-foreground-muted">Sold by</p>
                                    <p className="font-semibold text-foreground">
                                        {product.seller.email}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <AddToCartButton
                                    productId={product.id}
                                    productName={product.name}
                                    price={product.price}
                                    sellerId={product.sellerId}
                                    sellerEmail={product.seller.email}
                                />
                                <Link
                                    href="/#products"
                                    className="btn-secondary px-6 py-3 text-center"
                                >
                                    ← Back to Products
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}