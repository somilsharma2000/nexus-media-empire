import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
      <div className="w-full max-w-sm p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Command Center</h1>
        <form
          action={async (formData) => {
            "use server"
            await signIn("credentials", formData)
          }}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm font-semibold text-gray-400">
            Email
            <input 
              name="email" 
              type="email" 
              className="p-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-blue-500" 
              placeholder="admin@nexus.com" 
              required
            />
          </label>
          
          <label className="flex flex-col gap-1 text-sm font-semibold text-gray-400">
            Password
            <input 
              name="password" 
              type="password" 
              className="p-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-blue-500" 
              placeholder="••••••••" 
              required
            />
          </label>
          
          <button 
            type="submit" 
            className="mt-4 p-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
