export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Login to Riftshop</h2>
        
        <form className="space-y-4">
          <input name="email" type="email" placeholder="Email" required 
            className="w-full p-2 border rounded" />
            
          <input name="password" type="password" placeholder="Password" required 
            className="w-full p-2 border rounded" />
          
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
            Log In
          </button>
        </form>
        
        <p className="text-sm text-center">
          Don't have an account? <a href="/register" className="text-blue-600">Register here</a>
        </p>
      </div>
    </div>
  );
}