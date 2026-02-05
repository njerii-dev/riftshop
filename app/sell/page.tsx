import { createProduct } from "@/app/actions/products";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function SellPage() {
  // Only sellers and admins can list products
  const user = await requireRole(["SELLER", "ADMIN"]);

  return (
    <div className="min-h-screen bg-background-secondary py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-foreground-muted">
            <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">List Product</li>
          </ol>
        </nav>

        {/* Role indicator */}
        <div className="mb-4">
          <span className={`badge ${user?.role === 'ADMIN' ? 'badge-warning' : 'badge-success'}`}>
            {user?.role}
          </span>
          <span className="text-foreground-muted text-sm ml-2">Logged in as {user?.email}</span>
        </div>

        {/* Form Card */}
        <div className="bg-background rounded-3xl border border-border p-8 lg:p-10 shadow-lg">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">List a New Product</h1>
            <p className="text-foreground-muted">Share your product with thousands of potential buyers</p>
          </div>

          <form action={createProduct} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Vintage Camera, Handmade Jewelry"
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted font-medium">$</span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                  className="input pl-8"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe your product in detail. Include condition, dimensions, and any unique features..."
                required
                className="input resize-none"
              />
              <p className="text-xs text-foreground-muted mt-2">Write a compelling description to attract buyers</p>
            </div>

            {/* Image Upload Placeholder */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Image
              </label>
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-foreground font-medium mb-1">Drop your image here</p>
                <p className="text-foreground-muted text-sm">or click to browse (coming soon)</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="btn-primary w-full py-4 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Post to Marketplace
              </button>
            </div>
          </form>

          {/* Tips */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl border border-purple-500/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tips for a Great Listing
            </h3>
            <ul className="text-sm text-foreground-muted space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                Use a clear, descriptive title
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                Set a competitive price based on market research
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                Include detailed product specifications
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                Mention any defects or wear honestly
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}