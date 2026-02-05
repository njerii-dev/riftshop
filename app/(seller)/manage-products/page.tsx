import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";

// Force dynamic rendering - this page needs database access at runtime
export const dynamic = 'force-dynamic';

export default async function ManageProductsPage() {
    // Only sellers and admins can access this page
    const user = await requireRole(["SELLER", "ADMIN"]);

    // Get products based on role
    const products = user?.role === "ADMIN"
        ? await prisma.product.findMany({
            include: { seller: true },
            orderBy: { id: 'desc' }
        })
        : await prisma.product.findMany({
            where: { sellerId: user?.id },
            include: { seller: true },
            orderBy: { id: 'desc' }
        });

    const totalSales = await prisma.order.count({
        where: {
            product: {
                sellerId: user?.role === "ADMIN" ? undefined : user?.id
            }
        }
    });

    return (
        <div className="min-h-screen bg-background-secondary py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {user?.role === "ADMIN" ? "All Products" : "My Products"}
                        </h1>
                        <p className="text-foreground-muted">
                            {user?.role === "ADMIN"
                                ? "Manage all products listed on the marketplace"
                                : "View and manage your listed products"}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-foreground-muted">Total Sales</p>
                            <p className="text-2xl font-bold gradient-text">{totalSales}</p>
                        </div>
                        <Link href="/sell" className="btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Product
                        </Link>
                    </div>
                </div>

                {/* Role Badge */}
                <div className="mb-6">
                    <span className={`badge ${user?.role === 'ADMIN' ? 'badge-warning' : 'badge-success'}`}>
                        {user?.role}
                    </span>
                    <span className="text-foreground-muted text-sm ml-2">{user?.email}</span>
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
                                    {user?.role === "ADMIN" && <th>Seller</th>}
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
                                        {user?.role === "ADMIN" && (
                                            <td className="text-foreground-muted">{product.seller.email}</td>
                                        )}
                                        <td className="font-bold gradient-text">${product.price.toFixed(2)}</td>
                                        <td><span className="badge badge-success">Active</span></td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button className="text-foreground-muted hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background-secondary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
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
