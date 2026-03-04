import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function PaymentReportsPage() {
    const user = await requireRole(["ADMIN"]);

    // Fetch all payment records with related order & product data
    const payments = await prisma.mpesa_payments.findMany({
        orderBy: { created_at: "desc" },
    });

    // Fetch completed orders with product info for revenue calculations
    const completedOrders = await prisma.order.findMany({
        where: { status: "COMPLETED" },
        include: { product: true, customer: true },
        orderBy: { createdAt: "desc" },
    });

    // Aggregate stats
    const totalPayments = payments.length;
    const completedPayments = payments.filter((p) => p.status === "COMPLETED").length;
    const failedPayments = payments.filter((p) => p.status === "FAILED").length;
    const pendingPayments = payments.filter((p) => p.status === "PENDING").length;
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.product.price, 0);

    // Recent 7-day revenue (approximate)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRevenue = completedOrders
        .filter((o) => o.createdAt >= sevenDaysAgo)
        .reduce((sum, o) => sum + o.product.price, 0);

    const successRate = totalPayments > 0
        ? ((completedPayments / totalPayments) * 100).toFixed(1)
        : "0.0";

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
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>

                    <Link href="/dashboard/payments" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-foreground font-medium border-l-4 border-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Payments
                    </Link>

                    <Link href="/manage-products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Products
                    </Link>

                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        Users
                    </Link>
                </nav>

                {/* User Info at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                                ADMIN
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
                                <h1 className="text-2xl font-bold text-foreground">Payment Reports</h1>
                                <p className="text-sm text-foreground-muted">M-Pesa transaction history and analytics</p>
                            </div>
                            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                        {/* Total Revenue */}
                        <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 text-white overflow-hidden sm:col-span-2 lg:col-span-1">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                            <p className="text-green-200 text-xs font-medium mb-1 uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-2xl font-bold">KSh {totalRevenue.toFixed(0)}</h3>
                            <p className="text-green-200 text-xs mt-1">From {completedPayments} completed</p>
                        </div>

                        {/* 7-Day Revenue */}
                        <div className="bg-background rounded-2xl p-5 border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-foreground">KSh {recentRevenue.toFixed(0)}</h3>
                            <p className="text-foreground-muted text-xs">Last 7 Days</p>
                        </div>

                        {/* Success Rate */}
                        <div className="bg-background rounded-2xl p-5 border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{successRate}%</h3>
                            <p className="text-foreground-muted text-xs">Success Rate</p>
                        </div>

                        {/* Failed */}
                        <div className="bg-background rounded-2xl p-5 border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{failedPayments}</h3>
                            <p className="text-foreground-muted text-xs">Failed</p>
                        </div>

                        {/* Pending */}
                        <div className="bg-background rounded-2xl p-5 border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{pendingPayments}</h3>
                            <p className="text-foreground-muted text-xs">Pending</p>
                        </div>
                    </div>

                    {/* M-Pesa Payments Table */}
                    <div className="bg-background rounded-2xl border border-border overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">M-Pesa Payment Records</h2>
                                <p className="text-sm text-foreground-muted">{totalPayments} total transactions</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 text-xs text-foreground-muted bg-background-secondary px-3 py-1.5 rounded-lg">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {completedPayments} Completed
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-foreground-muted bg-background-secondary px-3 py-1.5 rounded-lg">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {failedPayments} Failed
                                </span>
                            </div>
                        </div>

                        {payments.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-foreground font-medium mb-1">No payment records yet</h3>
                                <p className="text-foreground-muted text-sm">Payment records will appear here once customers make M-Pesa transactions</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-background-secondary">
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">#</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Checkout ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Phone</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Receipt</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {payments.map((payment, index) => (
                                            <tr key={payment.id} className="hover:bg-background-secondary transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                                <td className="px-6 py-4 text-sm text-foreground-muted">{payment.id}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono text-foreground bg-background-secondary px-2 py-1 rounded-lg">
                                                        {payment.checkout_request_id ? payment.checkout_request_id.slice(-12) : "—"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground">
                                                    {payment.phone_number ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            {payment.phone_number}
                                                        </span>
                                                    ) : (
                                                        <span className="text-foreground-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {payment.amount ? (
                                                        <span className="font-semibold text-foreground">KSh {Number(payment.amount).toFixed(2)}</span>
                                                    ) : (
                                                        <span className="text-foreground-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {payment.mpesa_receipt ? (
                                                        <span className="text-xs font-mono text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                                                            {payment.mpesa_receipt}
                                                        </span>
                                                    ) : (
                                                        <span className="text-foreground-muted text-sm">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${payment.status === "COMPLETED"
                                                            ? "bg-green-100 text-green-700"
                                                            : payment.status === "FAILED"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-amber-100 text-amber-700"
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${payment.status === "COMPLETED"
                                                                ? "bg-green-500"
                                                                : payment.status === "FAILED"
                                                                    ? "bg-red-500"
                                                                    : "bg-amber-500"
                                                            }`}></span>
                                                        {payment.status || "PENDING"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground-muted">
                                                    {payment.created_at
                                                        ? new Date(payment.created_at).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Completed Orders with Product Details */}
                    <div className="bg-background rounded-2xl border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-bold text-foreground">Completed Orders</h2>
                            <p className="text-sm text-foreground-muted">Orders confirmed via M-Pesa payment</p>
                        </div>

                        {completedOrders.length === 0 ? (
                            <div className="p-12 text-center">
                                <h3 className="text-foreground font-medium mb-1">No completed orders</h3>
                                <p className="text-foreground-muted text-sm">Completed orders will appear here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {completedOrders.map((order, index) => (
                                    <div key={order.id} className="px-6 py-4 hover:bg-background-secondary transition-colors animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                {order.product.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground truncate">{order.product.name}</p>
                                                <p className="text-sm text-foreground-muted truncate">
                                                    {order.customer.email}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold gradient-text">KSh {order.product.price.toFixed(2)}</p>
                                                <p className="text-xs text-foreground-muted">
                                                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                {order.mpesaReceipt ? (
                                                    <span className="text-xs font-mono text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                                                        {order.mpesaReceipt}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                                        PAID
                                                    </span>
                                                )}
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
