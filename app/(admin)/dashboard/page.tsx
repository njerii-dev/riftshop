import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";

// Force dynamic rendering - this page needs database access at runtime
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Only admins can access this page
  const user = await requireRole(["ADMIN"]);

  // Fetch stats from database
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();

  const sellerCount = await prisma.user.count({
    where: { role: "SELLER" }
  });

  const customerCount = await prisma.user.count({
    where: { role: "CUSTOMER" }
  });

  const products = await prisma.product.findMany({
    include: { seller: true },
    orderBy: { id: 'desc' },
    take: 10
  });

  const users = await prisma.user.findMany({
    include: { products: true, purchases: true },
    orderBy: { id: 'desc' },
    take: 10
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
    <div className="min-h-screen bg-background-secondary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-foreground-muted">Manage your marketplace and monitor performance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-warning">ADMIN</span>
            <span className="text-foreground-muted text-sm">{user?.email}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <div className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-foreground">{userCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted mb-1">Sellers</p>
                <h3 className="text-3xl font-bold text-foreground">{sellerCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted mb-1">Customers</p>
                <h3 className="text-3xl font-bold text-foreground">{customerCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted mb-1">Products</p>
                <h3 className="text-3xl font-bold text-foreground">{productCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted mb-1">Orders</p>
                <h3 className="text-3xl font-bold text-foreground">{orderCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Management */}
          <div className="bg-background rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Manage Users</h2>
              <span className="badge badge-primary">{userCount} total</span>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted">
                <p>No users yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-background-secondary transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {u.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{u.email}</p>
                      <p className="text-sm text-foreground-muted">
                        {u.products.length} products • {u.purchases.length} orders
                      </p>
                    </div>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : u.role === 'SELLER' ? 'badge-success' : 'badge-primary'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Products */}
          <div className="bg-background rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Recent Products</h2>
              <span className="badge badge-primary">{productCount} total</span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted">
                <p>No products yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-background-secondary transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-sm text-foreground-muted truncate">by {product.seller.email}</p>
                    </div>
                    <span className="font-bold gradient-text">${product.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-background rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
              <span className="badge badge-primary">{orderCount} total</span>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted">
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Price</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-mono text-sm">{order.id.slice(0, 8)}...</td>
                        <td>{order.product.name}</td>
                        <td>{order.customer.email}</td>
                        <td className="font-bold gradient-text">${order.product.price.toFixed(2)}</td>
                        <td className="text-foreground-muted">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}