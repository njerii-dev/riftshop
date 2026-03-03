import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";

// Force dynamic rendering - this page needs database access at runtime
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Only admins can access this page
  const user = await requireRole(["ADMIN"]);

  // Fetch stats from database
  const [userCount, productCount, orderCount, sellerCount, customerCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } })
  ]);

  // Calculate revenue from orders
  const orders = await prisma.order.findMany({
    include: { product: true }
  });
  const totalRevenue = orders.reduce((sum, order) => sum + order.product.price, 0);

  const products = await prisma.product.findMany({
    include: { seller: true, orders: true },
    orderBy: { id: 'desc' },
    take: 5
  });

  const users = await prisma.user.findMany({
    include: { products: true, purchases: true },
    orderBy: { id: 'desc' },
    take: 6
  });

  const recentOrders = await prisma.order.findMany({
    include: {
      product: true,
      customer: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

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
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-foreground font-medium border-l-4 border-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
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

          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Orders
          </Link>

          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>

          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572C2.927 10.324 2.927 7.826 4.683 7.4a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
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
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-foreground-muted">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Quick Actions */}
                <Link href="/sell" className="btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Product
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue Card */}
            <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <p className="text-purple-200 text-sm font-medium mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold">KSh {totalRevenue.toFixed(2)}</h3>
                <p className="text-purple-200 text-xs mt-2 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  From {orderCount} orders
                </p>
              </div>
            </div>

            {/* Users Card */}
            <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-green-500 bg-green-100 px-2 py-1 rounded-full">Active</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{userCount}</h3>
              <p className="text-foreground-muted text-sm">Total Users</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  {sellerCount} Sellers
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {customerCount} Customers
                </span>
              </div>
            </div>

            {/* Products Card */}
            <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Listed</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{productCount}</h3>
              <p className="text-foreground-muted text-sm">Products</p>
              <Link href="/manage-products" className="mt-3 text-xs text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1">
                Manage Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Orders Card */}
            <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-1 rounded-full">Completed</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{orderCount}</h3>
              <p className="text-foreground-muted text-sm">Total Orders</p>
              <p className="mt-3 text-xs text-foreground-muted">
                Avg. KSh {orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : '0.00'} / order
              </p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-background rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
                  <p className="text-sm text-foreground-muted">Latest transactions on the platform</p>
                </div>
                <Link href="/profile" className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-foreground font-medium mb-1">No orders yet</h3>
                  <p className="text-foreground-muted text-sm">Orders will appear here once customers start buying</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentOrders.map((order, index) => (
                    <div key={order.id} className="px-6 py-4 hover:bg-background-secondary transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
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
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Users */}
            <div className="bg-background rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Users</h2>
                <p className="text-sm text-foreground-muted">Platform members</p>
              </div>

              {users.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-foreground-muted text-sm">No users yet</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {users.map((u, index) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-secondary transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.role === 'ADMIN' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                        u.role === 'SELLER' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                          'bg-gradient-to-br from-green-500 to-emerald-600'
                        }`}>
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.email}</p>
                        <p className="text-xs text-foreground-muted">
                          {u.products.length} products • {u.purchases.length} orders
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' :
                        u.role === 'SELLER' ? 'bg-cyan-100 text-cyan-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Products */}
          <div className="mt-8 bg-background rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Recent Products</h2>
                <p className="text-sm text-foreground-muted">Latest products added to the marketplace</p>
              </div>
              <Link href="/manage-products" className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All →</Link>
            </div>

            {products.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-foreground font-medium mb-1">No products yet</h3>
                <p className="text-foreground-muted text-sm mb-4">Be the first to add a product</p>
                <Link href="/sell" className="btn-primary">Add Product</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
                {products.map((product, index) => (
                  <div key={product.id} className="group bg-background-secondary rounded-xl p-4 hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="w-full h-24 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-transform">
                      <span className="text-3xl font-bold text-white">{product.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-medium text-foreground text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-foreground-muted truncate mb-2">{product.seller.email}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold gradient-text">KSh {product.price.toFixed(2)}</span>
                      <span className="text-xs text-foreground-muted">{product.orders.length} sold</span>
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