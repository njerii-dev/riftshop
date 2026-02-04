import { registerUser } from "@/app/actions/auth";

export default function Register() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 border rounded-xl bg-white shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create a Riftshop Account</h2>
        
        {/* The 'action' prop connects the form to our database function */}
        <form action={registerUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">I want to:</label>
            <select 
              name="role" 
              className="w-full p-3 mt-1 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="CUSTOMER">Buy Items (Customer)</option>
              <option value="SELLER">Sell Items (Seller)</option>
              <option value="ADMIN">Manage Site (Admin)</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}