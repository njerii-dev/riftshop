import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ManageProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { id: 'desc' }
    });

    return (
        <div className="min-h-screen bg-background-secondary py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Products</h1>
                        <p className="text-foreground-muted">View and manage your listed products</p>
                    </div>
                    <Link href="/sell" className="btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Product
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="bg-background rounded-2xl border border-border p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Products Listed</h3>
                        <p className="text-foreground-muted mb-6">Start selling by listing your first product</p>
                        <Link href="/sell" className="btn-primary">List Your First Product</Link>
                    </div>
                ) : (
                    <div className="bg-background rounded-2xl border border-border overflow-hidden">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {product.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{product.name}</p>
                                                    <p className="text-sm text-foreground-muted truncate max-w-xs">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-bold gradient-text">${product.price.toFixed(2)}</td>
                                        <td><span className="badge badge-success">Active</span></td>
                                        <td>
                                            <button className="text-foreground-muted hover:text-foreground transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
