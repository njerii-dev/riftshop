import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

// Force dynamic rendering - this page needs database access at runtime
export const dynamic = 'force-dynamic';

export default async function ManageProductsPage() {
    // Only sellers and admins can access this page
    const user = await requireRole(["SELLER", "ADMIN"]);

    // Get products based on role
    const products = user?.role === "ADMIN"
        ? await prisma.product.findMany({
            include: { seller: true, orders: true },
            orderBy: { id: 'desc' }
        })
        : await prisma.product.findMany({
            where: { sellerId: user?.id },
            include: { seller: true, orders: true },
            orderBy: { id: 'desc' }
        });

    const totalSales = await prisma.order.count({
        where: {
            product: {
                sellerId: user?.role === "ADMIN" ? undefined : user?.id
            }
        }
    });

    const totalRevenue = products.reduce((sum, product) => {
        return sum + (product.orders.length * product.price);
    }, 0);

    return (
        <div className="min-h-screen bg-background-secondary">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-full w-64 bg-background border-r border-border hidden lg:block z-50">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                            R
                        </span>
                        <span className="text-xl font-bold text-foreground">Riftshop</span>
                    </Link>
                </div>

                <nav className="px-4 space-y-1">
                    {user?.role === "ADMIN" && (
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                        </Link>
                    )}

                    <Link href="/manage-products" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-foreground font-medium border-l-4 border-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        My Products
                    </Link>

                    <Link href="/sell" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Product
                    </Link>

                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                    </Link>
                </nav>

                {/* User Info at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user?.role === 'ADMIN' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                            }`}>
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'
                                }`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                    <form action={logoutUser}>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64">
                {/* Top Header */}
                <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    {user?.role === "ADMIN" ? "All Products" : "My Products"}
                                </h1>
                                <p className="text-sm text-foreground-muted">
                                    {user?.role === "ADMIN"
                                        ? "Manage all products listed on the marketplace"
                                        : "View and manage your listed products"}
                                </p>
                            </div>
                            <Link href="/sell" className="btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Product
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
                            <p className="text-purple-200 text-sm font-medium mb-1">Total Products</p>
                            <h3 className="text-3xl font-bold">{products.length}</h3>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 text-white">
                            <p className="text-cyan-200 text-sm font-medium mb-1">Total Sales</p>
                            <h3 className="text-3xl font-bold">{totalSales}</h3>
                        </div>
                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
                            <p className="text-green-200 text-sm font-medium mb-1">Revenue</p>
                            <h3 className="text-3xl font-bold">${totalRevenue.toFixed(2)}</h3>
                        </div>
                    </div>

                    {/* Products */}
                    {products.length === 0 ? (
                        <div className="bg-background rounded-2xl border border-border p-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Products Listed</h3>
                            <p className="text-foreground-muted mb-6">Start selling by listing your first product</p>
                            <Link href="/sell" className="btn-primary">List Your First Product</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product, index) => (
                                <div key={product.id} className="bg-background rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="h-40 bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center relative overflow-hidden">
                                        <span className="text-5xl font-bold text-white/90 group-hover:scale-110 transition-transform">
                                            {product.name.charAt(0)}
                                        </span>
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full">
                                                {product.orders.length} sold
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-semibold text-foreground truncate mb-1">{product.name}</h3>
                                        <p className="text-sm text-foreground-muted line-clamp-2 mb-3">{product.description}</p>
                                        {user?.role === "ADMIN" && (
                                            <p className="text-xs text-foreground-muted mb-3">
                                                by {product.seller.email}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold gradient-text">${product.price.toFixed(2)}</span>

                                            {/* Action Buttons Container */}
                                            <div className="flex items-center gap-2">
                                                {/* EDIT BUTTON */}
                                                <Link
                                                    href={`/manage-products/edit/${product.id}`}
                                                    className="p-2 text-foreground-muted hover:text-purple-500 hover:bg-background-secondary rounded-lg transition-colors border border-transparent hover:border-border"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>

                                                {/* DELETE BUTTON */}
                                                <form action={async () => {
                                                    "use server";
                                                    await prisma.product.delete({ where: { id: product.id } });
                                                    revalidatePath("/manage-products");
                                                }}>
                                                    <button
                                                        type="submit"
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        onClick={() => { if (!confirm("Are you sure you want to delete this product?")) return; }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}