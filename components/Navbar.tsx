import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6 bg-white shadow-sm border-b">
      <Link href="/" className="text-2xl font-bold text-blue-600">Riftshop</Link>
      <div className="space-x-6 font-medium">
        <Link href="/" className="hover:text-blue-600">Marketplace</Link>
        <Link href="/login" className="hover:text-blue-600">Login</Link>
        <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md">Join Now</Link>
      </div>
    </nav>
  );
}