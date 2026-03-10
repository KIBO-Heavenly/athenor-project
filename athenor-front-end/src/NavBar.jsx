import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import { logout } from './ProtectedRoute';
import api from './api';
import maleProfilePic from './assets/athenor-male-pfp.jpg';
import femaleProfilePic from './assets/athenor-female-pfp.jpg';

// Helper function to get profile picture from user data
const getProfilePicFromUser = (user) => {
  if (!user?.profilePicture) return maleProfilePic;
  if (user.profilePicture === 'athenor-male-pfp') return maleProfilePic;
  if (user.profilePicture === 'athenor-female-pfp') return femaleProfilePic;
  if (user.profilePicture === 'fetch-from-backend') return null; // Return null to indicate we need to fetch
  if (user.profilePicture.startsWith('data:')) return user.profilePicture;
  return maleProfilePic;
};

export default function NavBar({ title, showBackButton = false, onBackClick = null }) {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  // Initialize state with defaults - will be updated from localStorage
  const [profilePicture, setProfilePicture] = useState(maleProfilePic);
  const [userName, setUserName] = useState('');
  const hasFetchedFromBackend = useRef(false); // Track if we've fetched from backend already
  const currentUserId = useRef(null); // Track current user ID to detect user changes

  // Function to fetch profile picture from backend
  const fetchProfilePictureFromBackend = async (userId) => {
    try {
      console.log('NavBar: Fetching user data from backend for userId:', userId);
      const response = await api.get(`/api/Users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('NavBar: Received user data from backend:', userData);
        
        // Update localStorage with fresh data from backend
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Handle large images - don't store in localStorage
        const isLargeImage = userData.profilePicture && 
          userData.profilePicture.startsWith('data:') && 
          userData.profilePicture.length > 500000;
        
        const updatedUser = {
          ...currentUser,
          fullName: userData.fullName || currentUser.fullName,
          profilePicture: isLargeImage ? 'fetch-from-backend' : (userData.profilePicture || currentUser.profilePicture),
          role: userData.role || currentUser.role
        };
        
        try {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (storageError) {
          console.warn('Failed to update localStorage:', storageError);
        }
        
        // Update the displayed name (with email fallback)
        if (userData.fullName) {
          setUserName(userData.fullName);
          console.log('NavBar: Set username to:', userData.fullName);
        } else if (userData.email) {
          const emailName = userData.email.split('@')[0];
          setUserName(emailName);
          console.log('NavBar: Set username from email to:', emailName);
        }
        
        // Update profile picture - set immediately regardless of type
        if (userData.profilePicture) {
          if (userData.profilePicture === 'athenor-male-pfp') {
            setProfilePicture(maleProfilePic);
            console.log('NavBar: Set male profile pic');
          } else if (userData.profilePicture === 'athenor-female-pfp') {
            setProfilePicture(femaleProfilePic);
            console.log('NavBar: Set female profile pic');
          } else if (userData.profilePicture.startsWith('data:')) {
            setProfilePicture(userData.profilePicture);
            console.log('NavBar: Set custom profile pic (base64)');
          } else {
            setProfilePicture(maleProfilePic);
            console.log('NavBar: Set default male profile pic');
          }
        } else {
          setProfilePicture(maleProfilePic);
          console.log('NavBar: No profile pic in data, using default male');
        }
        
        hasFetchedFromBackend.current = true;
      } else {
        console.log('NavBar: Backend response not OK:', response.status);
      }
    } catch (err) {
      console.log('NavBar: Failed to fetch profile picture from backend:', err);
    }
  };

  // Function to load user data from localStorage and optionally fetch from backend
  const loadUserData = (forceFetch = false) => {
    try {
      const userStr = localStorage.getItem('user');
      console.log('NavBar: Loading user data, localStorage:', userStr ? 'found' : 'not found');
      
      if (!userStr) return false;
      
      const user = JSON.parse(userStr);
      if (!user || !user.id) {
        console.log('NavBar: No user or user.id in localStorage');
        return false;
      }
      
      // Check if user changed (e.g., different account logged in)
      const userChanged = currentUserId.current !== user.id;
      if (userChanged) {
        currentUserId.current = user.id;
        hasFetchedFromBackend.current = false; // Reset fetch flag for new user
      }
      
      console.log('NavBar: User from localStorage:', { id: user.id, fullName: user.fullName, email: user.email, role: user.role });
      
      // Set name with fallback to email if fullName is empty
      if (user.fullName && user.fullName.trim()) {
        setUserName(user.fullName);
        console.log('NavBar: Set username from localStorage:', user.fullName);
      } else if (user.email) {
        const emailName = user.email.split('@')[0];
        setUserName(emailName);
        console.log('NavBar: Set username from email:', emailName);
      } else {
        setUserName('User');
        console.log('NavBar: No name or email, using default "User"');
      }
      
      // Get profile picture from localStorage
      const pic = getProfilePicFromUser(user);
      
      // Only set from localStorage if we haven't fetched from backend yet
      // OR if the localStorage has an actual image (not just a marker)
      if (!hasFetchedFromBackend.current || (pic && pic !== null)) {
        if (pic) {
          setProfilePicture(pic);
          console.log('NavBar: Set profile picture from localStorage');
        }
        // pic being null means 'fetch-from-backend' - we need to fetch
      }
      
      // Fetch from backend if:
      // 1. We haven't fetched yet, OR
      // 2. Force fetch is requested (manual refresh), OR  
      // 3. User changed
      if (!hasFetchedFromBackend.current || forceFetch || userChanged) {
        fetchProfilePictureFromBackend(user.id);
      }
      
      return true;
    } catch (err) {
      console.log('NavBar: Error loading user data:', err);
      return false;
    }
  };

  useEffect(() => {
    // Try to load user data immediately
    let loaded = loadUserData();
    
    // If data not available yet (race condition after login), retry a few times
    if (!loaded) {
      const retryTimes = [100, 200, 500, 1000, 2000]; // Retry at these intervals
      let retryIndex = 0;
      
      const retryLoad = () => {
        if (retryIndex < retryTimes.length) {
          setTimeout(() => {
            loaded = loadUserData();
            if (!loaded) {
              retryIndex++;
              retryLoad();
            } else {
              console.log('NavBar: User data loaded after retry');
            }
          }, retryTimes[retryIndex]);
        }
      };
      retryLoad();
    }
    
    // Listen for storage changes (real-time sync across tabs/components)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || !e.key) {
        loadUserData(true); // Force fetch on storage change
      }
    };
    
    // Listen for custom user data update events (same-tab sync)
    const handleUserDataUpdated = (e) => {
      console.log('NavBar: Received userDataUpdated event', e.detail);
      loadUserData(true); // Force fetch on update event
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataUpdated', handleUserDataUpdated);
    
    // Remove polling - it causes flashing and we have event listeners for changes
    // const interval = setInterval(loadUserData, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdated', handleUserDataUpdated);
      // clearInterval(interval);
    };
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
              logout();
              navigate('/');
            }}
            className="hover:text-white transition">Logout</button>
        </div>
      </div>
    </nav>
  );
}
