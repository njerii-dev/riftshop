import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";
import { deleteProduct } from "@/app/actions/products";

export const dynamic = 'force-dynamic';

export default async function ManageProductsPage() {
    // 1. Auth Check
    const user = await requireRole(["SELLER", "ADMIN"]);
    if (!user) return null;

    // 2. Fetch Products with Error Handling
    let products = [];
    try {
        products = await prisma.product.findMany({
            where: user.role === "ADMIN" ? {} : { sellerId: user.id },
            // Removed 'include' for now to see if it fixes the crash
            orderBy: { id: 'desc' }
        });
    } catch (error) {
        console.error("Database Error:", error);
        return <div className="p-20 text-center">Database connection failed.</div>;
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold">Store Management</h1>
                    <div className="flex gap-4">
                        <Link href="/sell" className="bg-white text-black px-4 py-2 rounded-lg font-bold">Add Product</Link>
                        <form action={logoutUser}>
                            <button className="text-gray-400 hover:text-white transition-colors">Sign Out</button>
                        </form>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-neutral-800 rounded-3xl">
                        <p className="text-gray-500">No products found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                                {product.imageUrl && (
                                    <div className="h-40 w-full relative">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold truncate">{product.name}</h3>
                                    <p className="text-purple-400 font-mono mb-4">KSh {product.price}</p>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/manage-products/edit/${product.id}`}
                                            className="flex-1 text-center bg-neutral-800 py-2 rounded-lg hover:bg-neutral-700 transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <form action={async () => {
                                            "use server";
                                            await deleteProduct(product.id);
                                        }}>
                                            <button type="submit" className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}