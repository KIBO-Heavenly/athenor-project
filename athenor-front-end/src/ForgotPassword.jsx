import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";
import Modal from "./Modal";
import { API_URL } from "./config";
import ParticleBackground from "./components/ParticleBackground";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/Auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setSubmitted(true);
      setModalTitle("Email Sent");
      setModalMessage(data.message || "If the email exists, a password reset link has been sent.");
      setModalType("success");
      setModalOpen(true);
    } catch (err) {
      setModalTitle("Error");
      setModalMessage("Something went wrong. Please try again.");
      setModalType("error");
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
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-center text-2xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Forgot Password</motion.h2>
        <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {submitted ? (
          <div className="text-center">
            <div className="text-6xl mb-4 text-emerald-500">✉️</div>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Check your email for a password reset link. If you don't see it, check your spam folder.
            </p>
            <button
              onClick={() => navigate("/")}
              className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
              }`}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Email Address</label>
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

            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Remember your password?{" "}
              <a href="/" className={`font-medium underline transition-colors ${
                isDarkMode
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : 'text-cyan-600 hover:text-cyan-700'
              }`}>
                Log in
              </a>
            </p>
          </form>
        )}
      </motion.div>
    </div>

      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
