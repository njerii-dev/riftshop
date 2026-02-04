import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form action={registerUser} className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        
        <input name="email" type="email" placeholder="Email" required 
          className="w-full p-2 border rounded" />
          
        <input name="password" type="password" placeholder="Password" required 
          className="w-full p-2 border rounded" />
          
        <select name="role" className="w-full p-2 border rounded">
          <option value="CUSTOMER">Customer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>
        
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold">
          Sign Up
        </button>
      </form>
    </div>
  );
}