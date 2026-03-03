import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    // All authenticated users can access
    const user = await requireRole(["CUSTOMER", "SELLER", "ADMIN"]);

    // Get user's orders
    const orders = await prisma.order.findMany({
        where: { customerId: user?.id },
        include: {
            product: {
                include: { seller: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Get user details
    const userDetails = await prisma.user.findUnique({
        where: { id: user?.id },
        include: {
            purchases: true,
            products: true,
        }
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.product.price, 0);

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
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Marketplace
                    </Link>

                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-foreground font-medium border-l-4 border-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                    </Link>

                    {(user?.role === "SELLER" || user?.role === "ADMIN") && (
                        <>
                            <Link href="/manage-products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        </>
                    )}

                    {user?.role === "ADMIN" && (
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Admin Dashboard
                        </Link>
                    )}
                </nav>

                {/* User Info at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user?.role === 'ADMIN' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                            user?.role === 'SELLER' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                                'bg-gradient-to-br from-green-500 to-emerald-600'
                            }`}>
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' :
                                user?.role === 'SELLER' ? 'bg-cyan-100 text-cyan-700' :
                                    'bg-green-100 text-green-700'
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
                {/* Profile Header */}
                <div className="relative">
                    <div className="h-48 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600"></div>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative -mt-20">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                                <div className={`w-32 h-32 rounded-2xl flex items-center justify-center text-5xl font-bold text-white border-4 border-background shadow-xl ${user?.role === 'ADMIN' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                    user?.role === 'SELLER' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                                        'bg-gradient-to-br from-green-500 to-emerald-600'
                                    }`}>
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 pb-2">
                                    <h1 className="text-3xl font-bold text-foreground">{user?.email}</h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' :
                                            user?.role === 'SELLER' ? 'bg-cyan-100 text-cyan-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {user?.role}
                                        </span>
                                        <span className="text-foreground-muted text-sm">
                                            Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-foreground-muted">Total Orders</p>
                                    <h3 className="text-2xl font-bold text-foreground">{orders.length}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-foreground-muted">Total Spent</p>
                                    <h3 className="text-2xl font-bold gradient-text">KSh {totalSpent.toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-foreground-muted">Account Status</p>
                                    <h3 className="text-2xl font-bold text-green-500">Active</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Section */}
                    <div className="bg-background rounded-2xl border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">My Orders</h2>
                                <p className="text-sm text-foreground-muted">Your purchase history</p>
                            </div>
                        </div>

                        {orders.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
                                <p className="text-foreground-muted mb-6">Start shopping to see your orders here</p>
                                <Link href="/" className="btn-primary">Explore Marketplace</Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {orders.map((order, index) => (
                                    <div key={order.id} className="px-6 py-5 hover:bg-background-secondary transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                                                {order.product.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-foreground">{order.product.name}</p>
                                                <p className="text-sm text-foreground-muted truncate">
                                                    Sold by {order.product.seller.email}
                                                </p>
                                                <p className="text-xs text-foreground-muted mt-1">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold gradient-text">KSh {order.product.price.toFixed(2)}</p>
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                                    Completed
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
