import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";
import Modal from "./Modal";
import { API_URL } from "./config";
import ParticleBackground from "./components/ParticleBackground";
import { motion } from "framer-motion";

export default function Register() {
  const { isDarkMode } = useDarkMode();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");
  const [showResendButton, setShowResendButton] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const response = await fetch(`${API_URL}/api/Auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email)
      });

      const data = await response.json();

      if (response.ok) {
        setModalTitle("Email Sent");
        setModalMessage("Verification email has been resent. Please check your inbox.");
        setModalType("success");
        setShowResendButton(false);
      } else {
        setModalTitle("Error");
        setModalMessage(data.message || "Failed to resend verification email.");
        setModalType("error");
      }
    } catch (err) {
      console.error(err);
      setModalTitle("Error");
      setModalMessage("Something went wrong!");
      setModalType("error");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password
          // role removed → backend forces Tutor
        }),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (response.ok) {
        setModalTitle("Success");
        setModalMessage("Registration successful! Please check your email to verify your account.");
        setModalType("success");
        setShowResendButton(false);
        setModalOpen(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setModalTitle("Registration Error");
        setModalMessage(data.message || "Registration failed");
        setModalType("error");
        // Show resend button if email already exists
        if (data.message && data.message.toLowerCase().includes("already")) {
          setShowResendButton(true);
        } else {
          setShowResendButton(false);
        }
        setModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setModalTitle("Error");
      setModalMessage("Something went wrong!");
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
          }`}>Register</motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`text-center text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Only university email addresses (@tamucc.edu or @islander.tamucc.edu) are allowed
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={`w-full border rounded-lg px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                  : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
              }`}
            />

            <div>
              <input
                type="email"
                placeholder="University Email (e.g., you@tamucc.edu)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full border rounded-lg px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                    : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
                }`}
              />
            </div>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full border rounded-lg px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                  : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
              }`}
            />

            {/* Role removed – backend decides it's Tutor */}

            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
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
          setShowResendButton(false);
          if (modalType === "success") {
            navigate("/");
          }
        }}
      >
        {showResendButton && (
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className={`mt-4 w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isDarkMode
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
            } ${resending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {resending ? "Sending..." : "Resend Verification Email"}
          </button>
        )}
      </Modal>
    </>
  );
}
