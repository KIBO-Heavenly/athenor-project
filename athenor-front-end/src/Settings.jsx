import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';

export default function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50'}`}>
      {/* NAVBAR */}
      <nav className={`w-full border-b backdrop-blur-xl ${
        isDarkMode 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-gradient-to-r from-blue-500/90 via-cyan-500/90 to-emerald-500/90'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-white">
            Athenor
          </div>

          <button
            onClick={() => navigate(-1)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-white hover:bg-white/20'
            }`}
          >
            Back
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <section className="w-full py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </h1>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your preferences and account settings
          </p>

          {/* DARK MODE TOGGLE */}
          <div className={`rounded-xl p-6 shadow-lg ${
            isDarkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dark Mode
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Toggle dark mode for a more comfortable viewing experience
                </p>
              </div>

              {/* TOGGLE SWITCH */}
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  isDarkMode
                    ? 'bg-emerald-600'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    isDarkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* CURRENT STATUS */}
          <div className={`mt-6 rounded-xl p-6 ${
            isDarkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-gradient-to-br from-blue-100 to-emerald-100 border border-blue-200'
          }`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-semibold">Current Theme:</span> {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
