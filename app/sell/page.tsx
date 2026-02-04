import { createProduct } from "@/app/actions/products";

export default function SellPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-2xl border">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">List a New Product</h1>
      
      <form action={createProduct} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input name="name" type="text" placeholder="e.g. Vintage Camera" required 
            className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
          <input name="price" type="number" step="0.01" placeholder="0.00" required 
            className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" rows={4} placeholder="Describe your item..." required 
            className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition">
          Post Product to Marketplace
        </button>
      </form>
    </div>
  );
}