import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';

export default function Modal({ isOpen, title, message, type = 'info', onClose, children }) {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleClose = () => {
    const redirectPath = sessionStorage.getItem('navigateAfterModal');
    onClose();
    if (redirectPath) {
      sessionStorage.removeItem('navigateAfterModal');
      navigate(redirectPath);
    }
  };

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
          border: isDarkMode ? 'border-red-700/50' : 'border-red-300',
          title: isDarkMode ? 'text-red-300' : 'text-red-800',
          button: isDarkMode
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          bg: isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50',
          border: isDarkMode ? 'border-emerald-700/50' : 'border-emerald-300',
          title: isDarkMode ? 'text-emerald-300' : 'text-emerald-800',
          button: isDarkMode
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-emerald-600 hover:bg-emerald-700'
        };
      case 'warning':
        return {
          bg: isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50',
          border: isDarkMode ? 'border-amber-700/50' : 'border-amber-300',
          title: isDarkMode ? 'text-amber-300' : 'text-amber-800',
          button: isDarkMode
            ? 'bg-amber-600 hover:bg-amber-700'
            : 'bg-amber-600 hover:bg-amber-700'
        };
      default:
        return {
          bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
          border: isDarkMode ? 'border-blue-700/50' : 'border-blue-300',
          title: isDarkMode ? 'text-blue-300' : 'text-blue-800',
          button: isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div
          className={`${styles.bg} border ${styles.border} rounded-2xl shadow-2xl max-w-md w-full p-8 backdrop-blur-lg animate-scaleIn ${
            isDarkMode ? 'bg-gray-800/90' : 'bg-white/95'
          }`}
        >
          {/* Title */}
          {title && (
            <h2 className={`text-xl font-bold mb-4 ${styles.title}`}>
              {title}
            </h2>
          )}

          {/* Message */}
          <p className={`text-base mb-6 leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {message}
          </p>

          {/* Custom children (like resend button) */}
          {children && (
            <div className="mb-4">
              {children}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 text-white ${styles.button}`}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
