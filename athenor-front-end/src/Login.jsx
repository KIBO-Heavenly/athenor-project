import { useState } from "react";
import logo from "./assets/Athenor_LOGO.png"; // ensure path is correct
import { useNavigate } from "react-router-dom"; // NEW

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
  const response = await fetch("http://localhost:5137/api/Auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  console.log("Response from server:", data);

  if (response.ok) {
    // Save user info in localStorage
    localStorage.setItem("user", JSON.stringify(data));

    // Redirect based on role
    if (data.role === "Admin") navigate("/admin-dashboard");
    else navigate("/tutor-dashboard");
  } else {
    alert(data.message); // show error from backend
  }

} catch (err) {
  console.error(err);
  alert("Something went wrong!");
} finally {
  setLoading(false);
}
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <img src={logo} alt="Athenor Logo" className="mx-auto w-32 h-auto mb-4" />
          <p className="text-gray-500 text-sm mt-2">Sign in to continue to your dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
            className={`w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 active:bg-blue-800 transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

                {/* Footer */}
                <p className="mt-6 text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 font-medium hover:text-blue-700 underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
