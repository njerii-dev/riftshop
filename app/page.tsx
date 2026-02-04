export default function Marketplace() {
  return (
    <div className="max-w-7xl mx-auto p-12 text-center">
      <h1 className="text-5xl font-extrabold text-blue-600">Riftshop Marketplace</h1>
      <p className="text-gray-600 mt-4 text-xl">The database is connected and we are live!</p>
      
      <div className="mt-10 flex justify-center gap-4">
        <a href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold">
          Join as Seller
        </a>
        <a href="/login" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-bold">
          Customer Login
        </a>
      </div>
    </div>
  );
}