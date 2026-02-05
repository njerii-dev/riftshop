import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    // All authenticated users can access, but we'll show customer view
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
        }
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.product.price, 0);

    return (
        <div className="min-h-screen bg-background-secondary py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Header */}
                <div className="bg-background rounded-3xl border border-border overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-purple-600 to-cyan-600"></div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 relative z-10">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white border-4 border-background">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 pb-2">
                                <h1 className="text-2xl font-bold text-foreground">{user?.email}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`badge ${user?.role === 'ADMIN' ? 'badge-warning' :
                                            user?.role === 'SELLER' ? 'badge-success' :
                                                'badge-primary'
                                        }`}>
                                        {user?.role}
                                    </span>
                                    <span className="text-foreground-muted text-sm">
                                        Member since {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="stat-card">
                        <p className="text-sm font-medium text-foreground-muted mb-1">Total Orders</p>
                        <h3 className="text-2xl font-bold text-foreground">{orders.length}</h3>
                    </div>
                    <div className="stat-card">
                        <p className="text-sm font-medium text-foreground-muted mb-1">Total Spent</p>
                        <h3 className="text-2xl font-bold gradient-text">${totalSpent.toFixed(2)}</h3>
                    </div>
                    <div className="stat-card">
                        <p className="text-sm font-medium text-foreground-muted mb-1">Account Status</p>
                        <h3 className="text-2xl font-bold text-green-500">Active</h3>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="bg-background rounded-2xl border border-border p-6">
                    <h2 className="text-xl font-bold text-foreground mb-6">My Orders</h2>

                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
                            <p className="text-foreground-muted mb-6">Start shopping to see your orders here</p>
                            <Link href="/" className="btn-primary">Explore Marketplace</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl bg-background-secondary hover:bg-background-secondary/80 transition-colors">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                                        {order.product.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground">{order.product.name}</p>
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
                                        <p className="font-bold gradient-text text-lg">${order.product.price.toFixed(2)}</p>
                                        <span className="badge badge-success text-xs">Completed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
