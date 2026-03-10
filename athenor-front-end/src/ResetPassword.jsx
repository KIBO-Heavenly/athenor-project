import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";
import Modal from "./Modal";
import { API_URL } from "./config";
import ParticleBackground from "./components/ParticleBackground";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const { isDarkMode } = useDarkMode();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#]/.test(password)
  };

  const allChecksPassed = Object.values(passwordChecks).every(check => check);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setModalTitle("Error");
      setModalMessage("Passwords do not match.");
      setModalType("error");
      setModalOpen(true);
      return;
    }

    if (!allChecksPassed) {
      setModalTitle("Error");
      setModalMessage("Password does not meet security requirements. Please check all requirements below.");
      setModalType("error");
      setModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/Auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setModalTitle("Success");
        setModalMessage(data.message || "Password reset successfully!");
        setModalType("success");
      } else {
        setModalTitle("Error");
        
        // Handle validation errors from ASP.NET Core
        let errorMessage = "Failed to reset password.";
        if (data.errors) {
          // Extract validation error messages
          const errorMessages = Object.values(data.errors).flat();
          errorMessage = errorMessages.join(" ");
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.title) {
          errorMessage = data.title;
        }
        
        setModalMessage(errorMessage);
        setModalType("error");
      }
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      setModalTitle("Error");
      setModalMessage(`Password reset request failed: ${err.message || 'Network error or server is unreachable. Please check your connection and try again.'}`);
      setModalType("error");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
          <div className="text-center">
            <div className="text-6xl mb-4 text-red-500">✗</div>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Invalid Reset Link
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This password reset link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
              }`}
            >Request New Link
            </button>
          </div>
        </motion.div>
      </div>
      </>
    );
  }

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
        {success ? (
          <div className="text-center">
            <div className="text-6xl mb-4 text-emerald-500">✓</div>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Password Reset!
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/")}
              className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
              }`}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <h2 className={`text-center text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Reset Password</h2>
            <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>New Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                      : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
                  }`}
                  required
                />
                
                {/* Password Requirements Tooltip */}
                {(passwordFocused || (password && !allChecksPassed)) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 p-3 rounded-lg text-xs ${
                      isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <p className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Password must contain:
                    </p>
                    <ul className="space-y-1">
                      <li className={`flex items-center ${passwordChecks.length ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="mr-2">{passwordChecks.length ? '✓' : '○'}</span>
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${passwordChecks.uppercase ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="mr-2">{passwordChecks.uppercase ? '✓' : '○'}</span>
                        One uppercase letter (A-Z)
                      </li>
                      <li className={`flex items-center ${passwordChecks.lowercase ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="mr-2">{passwordChecks.lowercase ? '✓' : '○'}</span>
                        One lowercase letter (a-z)
                      </li>
                      <li className={`flex items-center ${passwordChecks.number ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="mr-2">{passwordChecks.number ? '✓' : '○'}</span>
                        One number (0-9)
                      </li>
                      <li className={`flex items-center ${passwordChecks.special ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="mr-2">{passwordChecks.special ? '✓' : '○'}</span>
                        One special character (@$!%*?&#)
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
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
