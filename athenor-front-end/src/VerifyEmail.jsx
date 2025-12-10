import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";
import Modal from "./Modal";
import { API_URL } from "./config";

export default function VerifyEmail() {
  const { isDarkMode } = useDarkMode();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid verification link. No token provided.");
    }
  }, [searchParams]);

  const handleVerify = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/Auth/verify-email?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (response.ok) {
        setVerified(true);
      } else {
        setError(data.message || "Failed to verify email. The link may have expired.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
      <div className={`backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border animate-scaleIn ${
        isDarkMode
          ? 'bg-gray-800/90 border-gray-700'
          : 'bg-white/90 border-cyan-200'
      }`}>
        <div className="text-center">
          {/* Success State */}
          {verified && (
            <>
              <div className="relative mb-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'
                }`}>
                  <span className="text-5xl animate-bounce">✅</span>
                </div>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                You're All Set!
              </h2>
              <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your email has been verified successfully. Welcome to the team!
              </p>
              <button
                onClick={() => navigate("/")}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
                }`}
              >
                🔐 Go to Login
              </button>
            </>
          )}
          
          {/* Error State */}
          {error && !verified && (
            <>
              <div className="relative mb-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
                }`}>
                  <span className="text-5xl">❌</span>
                </div>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Oops! Something Went Wrong
              </h2>
              <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {error}
              </p>
              <button
                onClick={() => navigate("/")}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg text-white'
                }`}
              >
                🏠 Go to Login
              </button>
            </>
          )}
          
          {/* Confirmation State - User must click to verify */}
          {!verified && !error && token && (
            <>
              <div className="relative mb-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-cyan-900/50' : 'bg-cyan-100'
                }`}>
                  <span className="text-5xl">📬</span>
                </div>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Almost There!
              </h2>
              <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Just one click to verify your email and unlock your account!
              </p>
              <button
                onClick={handleVerify}
                disabled={loading}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                } ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-900/50'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-xl text-white shadow-lg shadow-cyan-200'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying... ⏳
                  </>
                ) : (
                  <>✨ Verify My Email ✨</>
                )}
              </button>
              <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                🔒 By clicking verify, you confirm this is your email address.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
