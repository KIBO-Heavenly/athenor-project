import { useState } from "react";
import logo from "./assets/Athenor_LOGO.png";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";

export default function Login() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
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
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50'
    }`}>
      <div className={`backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border ${
        isDarkMode
          ? 'bg-gray-800/90 border-gray-700'
          : 'bg-white/90 border-cyan-200'
      }`}>
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <img src={logo} alt="Athenor Logo" className="mx-auto w-32 h-auto mb-4" />
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sign in to continue to your dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full border rounded-lg px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                  : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
              }`}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full border rounded-lg px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                  : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
              }`}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-lg font-medium transition-all ${
              isDarkMode
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Footer */}
        <p className={`mt-6 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Don't have an account?{" "}
          <a href="/register" className={`font-medium underline transition-colors ${
            isDarkMode
              ? 'text-emerald-400 hover:text-emerald-300'
              : 'text-cyan-600 hover:text-cyan-700'
          }`}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
