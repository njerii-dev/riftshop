import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  // Fetch stats from database
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const products = await prisma.product.findMany({
    include: { seller: true },
    orderBy: { id: 'desc' },
    take: 10
  });

  const users = await prisma.user.findMany({
    include: { products: true },
    orderBy: { id: 'desc' },
    take: 10
  });

  return (
    <div className="min-h-screen bg-background-secondary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-foreground-muted">Manage your marketplace and monitor performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">↑ 12%</span>
              <span className="text-foreground-muted ml-2">from last month</span>
            </div>
          </div>

          <div className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted mb-1">Products Listed</p>
                <h3 className="text-3xl font-bold text-foreground">{productCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">↑ 8%</span>
              <span className="text-foreground-muted ml-2">from last month</span>
            </div>
          </div>

          <div className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted mb-1">Total Orders</p>
                <h3 className="text-3xl font-bold text-foreground">{orderCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">↑ 15%</span>
              <span className="text-foreground-muted ml-2">from last month</span>
            </div>
          </div>

          <div className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted mb-1">Revenue</p>
                <h3 className="text-3xl font-bold text-foreground">$12.5K</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">↑ 23%</span>
              <span className="text-foreground-muted ml-2">from last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      <p className="text-sm text-foreground-muted truncate">{product.seller.email}</p>
                    </div>
                    <span className="font-bold gradient-text">${product.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-background rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Recent Users</h2>
              <span className="badge badge-primary">{userCount} total</span>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted">
                <p>No users yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-background-secondary transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{user.email}</p>
                      <p className="text-sm text-foreground-muted">{user.products.length} products</p>
                    </div>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-warning' : user.role === 'SELLER' ? 'badge-success' : 'badge-primary'}`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}