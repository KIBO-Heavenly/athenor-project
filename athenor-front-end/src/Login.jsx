import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: replace with your real auth logic (API call, Firebase, etc.)
    console.log("Logging in with:", { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Athenor Login
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 active:bg-blue-800 transition-all"
          >
            Log In
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <a
            href="#"
            className="text-blue-600 font-medium hover:text-blue-700 underline-offset-2 hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
