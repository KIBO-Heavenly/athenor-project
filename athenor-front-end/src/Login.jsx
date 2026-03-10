import { useState } from "react";
import logo from "./assets/Athenor_LOGO.png";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";
import Modal from "./Modal";
import { API_URL } from "./config";
import ParticleBackground from "./components/ParticleBackground";
import { motion } from "framer-motion";

export default function Login() 
{
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(""); // Show cold start status
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");
  const [showResendButton, setShowResendButton] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => 
    {
    setResending(true);
    try {
      const response = await fetch(`${API_URL}/api/Auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) 
        {
        setResendMessage("Verification email sent! Please check your inbox.");
        setResendSuccess(true);
        setShowResendButton(false);
      } 
      else 
     {     
        setResendMessage(data.message || "Failed to resend verification email.");
        setResendSuccess(false);
      }
    } 
    
    catch (err) {
      console.error(err);
      setResendMessage(`Failed to resend verification email: ${err.message || 'Network error or server is unreachable.'}`);
      setResendSuccess(false);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage("Starting...");
    setShowResendButton(false);

    // STEP 1: Warmup ping to wake up the server (Azure Free Tier cold start)
    console.log('Sending warmup ping to wake up server...');
    setLoadingMessage("Connecting to server...");
    
    try {
      const pingController = new AbortController();
      const pingTimeout = setTimeout(() => pingController.abort(), 90000); // 90s timeout for ping
      
      await fetch(`${API_URL}/api/Ping`, {
        method: "GET",
        signal: pingController.signal
      });
      clearTimeout(pingTimeout);
      console.log('Server is awake!');
    } catch (pingError) {
      console.log('Ping failed or timed out, will try login anyway:', pingError.message);
      // Don't fail here - the login might still work
    }

    // STEP 2: Now attempt login with a generous timeout
    setLoadingMessage("Logging in...");
    console.log('Attempting login...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for login
    
    try {
      const response = await fetch(`${API_URL}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Handle 403 errors separately - they often return HTML, not JSON
      if (response.status === 403) {
        const responseText = await response.text();
        if (responseText.includes("stopped") || responseText.includes("web app is stopped")) {
          setModalTitle("Server Stopped");
          setModalMessage("The server is currently stopped. Please contact the administrator to restart it.");
          setModalType("error");
        } else if (responseText.includes("quota") || responseText.includes("exceeded")) {
          setModalTitle("Server Quota Exceeded");
          setModalMessage("The server has reached its daily quota limit. This typically resets at midnight UTC (6 PM CST). Please try again later.");
          setModalType("warning");
        } else {
          setModalTitle("Server Unavailable");
          setModalMessage("The server is currently unavailable (403 Forbidden). Please contact the administrator.");
          setModalType("error");
        }
        setModalOpen(true);
        setLoading(false);
        setLoadingMessage("");
        return;
      }

      // Try to parse JSON response
      let data;
      try {
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
          setModalTitle("Server Error");
          setModalMessage("The server returned an empty response. Please try again.");
          setModalType("error");
          setModalOpen(true);
          setLoading(false);
          setLoadingMessage("");
          return;
        }
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        setModalTitle("Server Error");
        setModalMessage("The server returned an invalid response. Please try again.");
        setModalType("error");
        setModalOpen(true);
        setLoading(false);
        setLoadingMessage("");
        return;
      }

        if (response.ok) {
          // SUCCESS! Save JWT token and user info
          setLoadingMessage("✅ Logging in...");
          
          const token = data.token;
          
          // IMPORTANT: Don't store large base64 profile pictures in localStorage
          // localStorage has a 5MB limit and base64 images can easily exceed this
          let profilePicToStore = data.user.profilePicture || 'athenor-male-pfp';
          
          // If it's a base64 image (starts with 'data:'), store a marker instead
          // The NavBar will fetch it from the backend
          if (profilePicToStore && profilePicToStore.startsWith('data:')) {
            console.log('Profile picture is base64, storing marker instead of full data');
            profilePicToStore = 'fetch-from-backend';
          }
          
          const user = {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.fullName || '',
            role: data.user.role,
            profilePicture: profilePicToStore,
            optOutReviews: data.user.optOutReviews || false
          };
          
          // Store authentication data with error handling for quota issues
          try {
            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user));
            console.log("Login successful, user saved to localStorage:", user);
            console.log("User fullName:", user.fullName);
            console.log("User role:", user.role);
          } catch (storageError) {
            console.error("localStorage error:", storageError);
            // Try to clear old data and retry
            try {
              localStorage.removeItem("user");
              localStorage.setItem("authToken", token);
              // Store minimal user data without profile picture
              const minimalUser = {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.fullName || '',
                role: data.user.role,
                profilePicture: 'fetch-from-backend',
                optOutReviews: data.user.optOutReviews || false
              };
              localStorage.setItem("user", JSON.stringify(minimalUser));
              console.log("Saved minimal user data after storage error");
            } catch (retryError) {
              console.error("Critical localStorage error:", retryError);
              // Continue anyway - user can still login, just won't persist
            }
          }

          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: user }));
          window.dispatchEvent(new Event('storage'));

          // Give localStorage and events time to propagate
          await new Promise(resolve => setTimeout(resolve, 200));

          // Redirect to dashboard based on role
          if (data.user.role === "Admin") {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate("/tutor-dashboard", { replace: true });
          }
          setLoading(false);
          setLoadingMessage("");
          return; // Success - exit
        } else {
          // Handle specific error types from API responses
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
          } else if (data.errorType === "wrong_password") {
            setModalTitle("Wrong Password");
            setModalMessage(data.message || "Incorrect password. Please try again.");
            setModalType("error");
            setShowResendButton(false);
          } else {
            setModalTitle("Login Failed");
            setModalMessage(data.message || "Invalid credentials.");
            setModalType("error");
            setShowResendButton(false);
          }
          setModalOpen(true);
          setLoading(false);
          setLoadingMessage("");
          return; // Exit on definitive API error
        }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Login error:', error);
      
      if (error.name === 'AbortError') {
        setModalTitle("Request Timeout");
        setModalMessage("The login request took too long. The server may still be starting up. Please try again.");
        setModalType("warning");
      } else if (error.message && error.message.includes('Failed to fetch')) {
        setModalTitle("Connection Failed");
        setModalMessage("Could not connect to the server. Please check your internet connection and try again.");
        setModalType("error");
      } else {
        setModalTitle("Login Error");
        setModalMessage(`An error occurred: ${error.message || 'Unknown error'}`);
        setModalType("error");
      }
      setModalOpen(true);
      setLoading(false);
      setLoadingMessage("");
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
              {loading ? (loadingMessage || "Logging in...") : "Log In"}
            </button>
          </form>

                
          {/* Resend Verification Email Button - shown when email not verified */}
          {/*
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
          */}

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
