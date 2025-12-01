import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';

export default function TutorDashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  return (
    <div className={`min-h-screen ${
      isDarkMode
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50'
    }`}>

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

          <div className="flex items-center gap-8 text-gray-100 font-medium">
            <button
              onClick={() => navigate('/settings')}
              className="hover:text-white transition">Settings</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className={`w-full ${
        isDarkMode
          ? 'bg-gradient-to-b from-gray-800/50 to-gray-900/50'
          : 'bg-gradient-to-b from-blue-100 via-cyan-50 to-emerald-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <h1 className={`text-5xl font-bold leading-tight tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            A Cleaner, Faster Way to Organize Our Tutoring
          </h1>

          <p className={`text-lg mt-6 max-w-2xl mx-auto leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Athenor provides a streamlined and powerful dashboard for tutors
            looking to simplify analytics, operations, and scheduling.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <button 
              onClick={() => navigate('/tutor-schedule')}
              className={`px-8 py-3 rounded-xl shadow transition font-medium text-white ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg'
              }`}>
              Schedule
            </button>

            <button className={`px-8 py-3 rounded-xl transition font-medium ${
              isDarkMode
                ? 'border border-gray-600 text-gray-300 hover:bg-gray-700/50'
                : 'border border-cyan-400 text-gray-700 hover:bg-white/50'
            }`}>
              Tutor Reviews
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
