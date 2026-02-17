import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function ManageProductsPage() {
    const user = await requireRole(["SELLER", "ADMIN"]);

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

    // ... (Keep the totalSales and totalRevenue logic here)

    return (
        <div className="min-h-screen bg-background-secondary">
            {/* ... Sidebar and Header stay the same ... */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-background rounded-2xl border border-border overflow-hidden">
                        <div className="h-40 bg-neutral-900 flex items-center justify-center relative">
                            {/* REMOVED onError handler to prevent the crash */}
                            <img
                                src={product.imageUrl || "/placeholder.png"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-5">
                            <h3 className="font-semibold truncate">{product.name}</h3>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xl font-bold text-cyan-500">${product.price.toFixed(2)}</span>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/manage-products/edit/${product.id}`}
                                        className="p-2 border rounded-lg hover:bg-neutral-100"
                                    >
                                        Edit
                                    </Link>

                                    <form action={async () => {
                                        "use server"
                                        await prisma.product.delete({ where: { id: product.id } });
                                        revalidatePath("/manage-products");
                                    }}>
                                        {/* REMOVED the onClick confirm() to prevent the crash */}
                                        <button type="submit" className="p-2 text-red-400 border rounded-lg hover:bg-red-50">
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}