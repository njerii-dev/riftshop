import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function EditProductPage({ params }: { params: { id: string } }) {
    // 1. Fetch the product from the database using the ID from the URL
    const product = await prisma.product.findUnique({
        where: { id: params.id }
    });

    if (!product) {
        return <div className="p-20 text-center text-white">Product not found.</div>;
    }

    // 2. The Server Action to update the product
    async function updateProduct(formData: FormData) {
        "use server";

        const name = formData.get("name") as string;
        const price = parseFloat(formData.get("price") as string);
        const description = formData.get("description") as string;
        const imageUrl = formData.get("imageUrl") as string;

        await prisma.product.update({
            where: { id: params.id },
            data: { name, price, description, imageUrl }
        });

        // Refresh the data and go back to the dashboard
        revalidatePath("/manage-products");
        redirect("/manage-products");
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-lg bg-neutral-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Edit Product</h2>

                <form action={updateProduct} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Product Name</label>
                        <input name="name" defaultValue={product.name} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white focus:border-purple-500 outline-none" required />
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Price ($)</label>
                        <input name="price" type="number" step="0.01" defaultValue={product.price} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white focus:border-purple-500 outline-none" required />
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Description</label>
                        <textarea name="description" defaultValue={product.description || ""} rows={3} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white focus:border-purple-500 outline-none" />
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Image URL (Cloudinary)</label>
                        <input name="imageUrl" defaultValue={product.imageUrl || ""} className="w-full bg-black border border-white/10 p-3 rounded-xl text-white focus:border-purple-500 outline-none" />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Link href="/manage-products" className="flex-1 text-center py-3 rounded-xl font-bold text-white border border-white/10 hover:bg-white/5">
                            Cancel
                        </Link>
                        <button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 py-3 rounded-xl font-bold text-white hover:opacity-90">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Separate import needed for the Cancel button
import Link from "next/link";