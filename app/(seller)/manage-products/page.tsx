import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function ManageProductsPage() {
    const user = await requireRole(["SELLER", "ADMIN"]);

    const products = await prisma.product.findMany({
        where: user?.role === "ADMIN" ? {} : { sellerId: user?.id },
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
        <div className="min-h-screen bg-background-secondary text-foreground">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-full w-64 bg-background border-r border-border hidden lg:block z-50">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">R</span>
                        <span className="text-xl font-bold">Riftshop</span>
                    </Link>
                </div>
                <nav className="px-4 space-y-1">
                    <Link href="/manage-products" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 text-foreground font-medium border-l-4 border-purple-500">
                        My Products
                    </Link>
                    <Link href="/sell" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:bg-background-secondary transition-colors">
                        Add Product
                    </Link>
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <form action={logoutUser}>
                        <button type="submit" className="w-full text-sm text-foreground-muted hover:text-foreground py-2">
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64">
                <header className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Manage Store</h1>
                        <Link href="/sell" className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold">
                            + New Product
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        <div className="bg-background border border-border p-6 rounded-2xl">
                            <p className="text-foreground-muted text-sm">Products</p>
                            <p className="text-2xl font-bold">{products.length}</p>
                        </div>
                        <div className="bg-background border border-border p-6 rounded-2xl">
                            <p className="text-foreground-muted text-sm">Sales</p>
                            <p className="text-2xl font-bold">{totalSales}</p>
                        </div>
                        <div className="bg-background border border-border p-6 rounded-2xl">
                            <p className="text-foreground-muted text-sm">Revenue</p>
                            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-background rounded-2xl border border-border overflow-hidden">
                                <div className="h-48 bg-neutral-900">
                                    {/* We use a standard img tag without onError to stay on the server */}
                                    <img
                                        src={product.imageUrl || "https://placehold.co/600x400?text=No+Image"}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                                    <p className="text-cyan-500 font-bold mb-4">${product.price.toFixed(2)}</p>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/manage-products/edit/${product.id}`}
                                            className="flex-1 text-center bg-neutral-100 dark:bg-neutral-800 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity"
                                        >
                                            Edit
                                        </Link>
                                        <form action={async () => {
                                            "use server";
                                            await prisma.product.delete({ where: { id: product.id } });
                                            revalidatePath("/manage-products");
                                        }} className="flex-1">
                                            <button
                                                type="submit"
                                                className="w-full bg-red-500/10 text-red-500 py-2 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </header>
            </main>
        </div>
    );
}