import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  // Fetch stats from Neon
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const products = await prisma.product.findMany({
    include: { seller: true }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Control Panel</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
          <p className="text-lg opacity-80">Total Users</p>
          <h2 className="text-4xl font-bold">{userCount}</h2>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
          <p className="text-lg opacity-80">Products Listed</p>