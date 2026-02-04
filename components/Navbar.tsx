import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6 bg-white shadow-sm border-b">
      <Linimport Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6 bg-white shadow-sm border-b">
      <Link href="/" className="text-2xl font-bold text-blue-600">Riftshop</Link>
      
      <div className="space-x-6 font-medium flex items-center">
        <Link href="/" className="hover:text-blue-600 text-black">Marketplace</Link>
        
        {/* THIS IS THE NEW LINK WE ADDED */}
        <Link href="/sell" className="hover:text-blue-600 text-black font-semibold border-l pl-6 border-gray-200">
          Sell Item
        </Link>
        
        <Link href="/login" className="hover:text-blue-600 text-black">Login</Link>
        
        <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Join Now
        </Link>
      </div>
    </nav>
  );
}k href="/" className="text-2xl font-bold text-blue-600">Riftshop</Link>
      <div className="space-x-6 font-medium">
        <Link href="/" className="hover:text-blue-600">Marketplace</Link>
        <Link href="/login" className="hover:text-blue-600">Login</Link>
        <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md">Join Now</Link>
      </div>
    </nav>
  );
}