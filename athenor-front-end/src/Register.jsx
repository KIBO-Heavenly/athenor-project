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
  const [passwordFocused, setPasswordFocused] = useState(false);

  const navigate = useNavigate();

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#]/.test(password)
  };

  const allChecksPassed = Object.values(passwordChecks).every(check => check);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const response = await fetch(`${API_URL}/api/Auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        data = { message: textResponse || 'An unexpected error occurred. Please try again.' };
      }

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
    
    // Prevent double-clicks
    if (loading) return;
    
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

      // Handle non-JSON responses (e.g., rate limiting, server errors)
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        data = { message: textResponse || 'An unexpected error occurred. Please try again.' };
      }
      console.log("Registration response:", data);

      if (response.ok) {
        setModalTitle("Success");
        setModalMessage("Registration successful! Please check your email to verify your account. Click OK to continue to the login page.");
        setModalType("success");
        setShowResendButton(false);
        setModalOpen(true);
        // User must click OK button to continue - no auto-navigation
      } else {
        setModalTitle("Registration Error");
        
        // Handle validation errors from ASP.NET Core
        let errorMessage = "Registration failed. Please check your input and try again.";
        
        try {
          // Debug: log the raw data
          console.log('Error response data:', data);
          console.log('Error response data type:', typeof data);
          
          // If data is a string (shouldn't happen, but just in case), try to parse it
          let parsedData = data;
          if (typeof data === 'string') {
            try {
              parsedData = JSON.parse(data);
            } catch {
              // If it's just a plain string error message, use it
              errorMessage = data;
              parsedData = null;
            }
          }
          
          if (parsedData) {
            // Handle ASP.NET Core validation errors format
            if (parsedData.errors && typeof parsedData.errors === 'object') {
              const allErrors = [];
              for (const [field, messages] of Object.entries(parsedData.errors)) {
                if (Array.isArray(messages)) {
                  allErrors.push(...messages);
                } else if (typeof messages === 'string') {
                  allErrors.push(messages);
                }
              }
              if (allErrors.length > 0) {
                errorMessage = allErrors.join(' ');
              }
            } else if (parsedData.message) {
              errorMessage = parsedData.message;
            } else if (parsedData.title && parsedData.title !== 'One or more validation errors occurred.') {
              errorMessage = parsedData.title;
            }
          }
        } catch (parseErr) {
          console.error('Error parsing validation response:', parseErr);
          errorMessage = "Registration failed. Please check your input and try again.";
        }
        
        setModalMessage(errorMessage);
        setModalType("error");
        // Show resend button if email already exists
        if (errorMessage.toLowerCase().includes("already")) {
          setShowResendButton(true);
        } else {
          setShowResendButton(false);
        }
        setModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setModalTitle("Error");
      setModalMessage(`Registration request failed: ${err.message || 'Network error or server is unreachable. Please check your connection and try again.'}`);
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

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                className={`w-full border rounded-lg px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                    : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
                }`}
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
