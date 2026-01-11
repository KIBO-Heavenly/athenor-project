import { useState } from "react";
import logo from "./assets/Athenor_LOGO.png";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";
import Modal from "./Modal";
import { API_URL } from "./config";
import ParticleBackground from "./components/ParticleBackground";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");
  const [showResendButton, setShowResendButton] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const response = await fetch(`${API_URL}/api/Auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage("Verification email sent! Please check your inbox.");
        setResendSuccess(true);
        setShowResendButton(false);
      } else {
        setResendMessage(data.message || "Failed to resend verification email.");
        setResendSuccess(false);
      }
    } catch (err) {
      console.error(err);
      setResendMessage("Something went wrong. Please try again.");
      setResendSuccess(false);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResendButton(false);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${API_URL}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        // Save user info in localStorage
        const user = {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          profilePicture: data.profilePicture,
          optOutReviews: data.optOutReviews
        };
        localStorage.setItem("user", JSON.stringify(user));
        console.log("Login successful:", user);

        // Redirect to dashboard based on role
        if (data.role === "Admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/tutor-dashboard");
        }
      } else if (response.status === 403) {
        // 403 often means quota exceeded on Azure
        setModalTitle("Server Unavailable");
        setModalMessage("The server has reached its daily quota limit. This typically resets at midnight UTC. Please try again later or contact the administrator.");
        setModalType("warning");
        setModalOpen(true);
      } else {
        // Handle specific error types
        if (data.errorType === "not_verified") {
          setShowResendButton(true);
          setResendMessage("");
          setModalTitle("Email Not Verified");
          setModalMessage(data.message || "Please verify your email before logging in.");
          setModalType("warning");
        } else if (data.errorType === "not_found") {
          setModalTitle("Account Not Found");
          setModalMessage(data.message || "No account found with this email.");
          setModalType("error");
          setShowResendButton(false);
        } else {
          setModalTitle("Login Failed");
          setModalMessage(data.message || "Invalid credentials.");
          setModalType("error");
          setShowResendButton(false);
        }
        setModalOpen(true);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Login error:", error);
      
      // Check if it was a timeout (AbortError)
      if (error.name === 'AbortError') {
        setModalTitle("Server Quota Exceeded");
        setModalMessage("The server is not responding. This usually means the daily CPU quota has been reached. The quota resets at midnight UTC (6 PM CST). Please try again later.");
        setModalType("warning");
      } else {
        setModalTitle("Connection Error");
        setModalMessage("Unable to connect to the server. Please check your internet connection and try again.");
        setModalType("error");
      }
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {/* Particle Background */}
      <ParticleBackground isDarkMode={isDarkMode} />
      
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className={`backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border ${
          isDarkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-white/80 border-cyan-200'
        }`}>
          {/* Logo / Title */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.img 
              src={logo} 
              alt="Athenor Logo" 
              className="mx-auto w-75 h-auto mb-4"
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
              transition={{ duration: 0.3 }}
            />
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sign in to continue to your dashboard</p>
          </motion.div>

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
              <div className="text-right mt-1">
                <a href="/forgot-password" className={`text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-cyan-600 hover:text-cyan-700'
                }`}>
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Resend Verification Email Button - shown when email not verified */}
          {showResendButton && (
            <div className="mt-4">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                } ${resending ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          )}

          {/* Resend feedback message */}
          {resendMessage && (
            <p className={`mt-3 text-sm text-center ${
              resendSuccess
                ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                : (isDarkMode ? 'text-red-400' : 'text-red-600')
            }`}>
              {resendMessage}
            </p>
          )}

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
        </motion.div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => {
          setModalOpen(false);
        }}
      />
    </>
  );
}
