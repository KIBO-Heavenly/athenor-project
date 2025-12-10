import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import maleProfilePic from './assets/athenor-male-pfp.jpg';
import femaleProfilePic from './assets/athenor-female-pfp.jpg';

export default function NavBar({ title, showBackButton = false, onBackClick = null }) {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [profilePicture, setProfilePicture] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
      setUserName(user.fullName);
    }
    if (user.profilePicture) {
      if (user.profilePicture === 'athenor-male-pfp') {
        setProfilePicture(maleProfilePic);
      } else if (user.profilePicture === 'athenor-female-pfp') {
        setProfilePicture(femaleProfilePic);
      } else if (user.profilePicture.startsWith('data:')) {
        setProfilePicture(user.profilePicture);
      }
    }
  }, []);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <nav className={`w-full border-b backdrop-blur-xl ${
      isDarkMode
        ? 'bg-gray-800/90 border-gray-700'
        : 'bg-gradient-to-r from-blue-600/90 via-cyan-500/90 to-emerald-500/90'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LEFT SIDE - Profile Picture and Name */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            {profilePicture && (
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            )}
            {userName && (
              <p className={`text-xs font-medium ${profilePicture ? 'mt-1' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-100'}`}>
                {userName}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - Buttons */}
        <div className="flex items-center gap-8 text-gray-100 font-medium">
          {showBackButton && (
            <button
              onClick={handleBack}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Back
            </button>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="hover:text-white transition">Settings</button>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/');
            }}
            className="hover:text-white transition">Logout</button>
        </div>
      </div>
    </nav>
  );
}
