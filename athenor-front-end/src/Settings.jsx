import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import Modal from './Modal';
import { API_URL } from './config';
import api from './api';
import maleProfilePic from './assets/athenor-male-pfp.jpg';
import femaleProfilePic from './assets/athenor-female-pfp.jpg';

export default function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, disableEffects, toggleDisableEffects } = useDarkMode();
  const [profilePicture, setProfilePicture] = useState(null); // Initialize as null to prevent flashing
  const [pendingProfilePicture, setPendingProfilePicture] = useState('');
  const [hasUnsavedPicture, setHasUnsavedPicture] = useState(false);
  const [savingPicture, setSavingPicture] = useState(false);
  const [userName, setUserName] = useState('');
  const [optOutReviews, setOptOutReviews] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  
  // Modal state for alerts
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');

  // Helper function to show modal
  const showModal = (title, message, type = 'info') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  // Function to load user data
  const loadUserData = async () => {
    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      setUserId(user.id);
      
      // Fetch fresh data from backend
      try {
        const response = await api.get(`/api/Users/${user.id}`);
        if (response.ok) {
          const backendUser = await response.json();
          console.log('Loaded user data from backend:', backendUser);
          
          // Update localStorage with backend data - but handle large images carefully
          const isLargeImage = backendUser.profilePicture && 
            backendUser.profilePicture.startsWith('data:') && 
            backendUser.profilePicture.length > 500000;
          
          const updatedUser = {
            ...user,
            // For large images, store a marker instead of the actual base64 data
            profilePicture: isLargeImage ? 'fetch-from-backend' : backendUser.profilePicture,
            optOutReviews: backendUser.optOutReviews,
            fullName: backendUser.fullName,
            role: backendUser.role
          };
          
          try {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } catch (storageError) {
            // If localStorage fails, store with marker
            console.warn('localStorage quota issue, using minimal data');
            updatedUser.profilePicture = 'fetch-from-backend';
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          // Update state with backend data
          if (backendUser.fullName) {
            setUserName(backendUser.fullName);
          }
          
          if (backendUser.profilePicture) {
            if (backendUser.profilePicture === 'athenor-male-pfp') {
              setProfilePicture(maleProfilePic);
            } else if (backendUser.profilePicture === 'athenor-female-pfp') {
              setProfilePicture(femaleProfilePic);
            } else if (backendUser.profilePicture.startsWith('data:')) {
              setProfilePicture(backendUser.profilePicture);
            } else {
              setProfilePicture(maleProfilePic);
            }
          } else {
            setProfilePicture(maleProfilePic);
          }
          
          if (typeof backendUser.optOutReviews === 'boolean') {
            setOptOutReviews(backendUser.optOutReviews);
          }
          
          setIsLoading(false);
          return; // Successfully loaded from backend
        }
      } catch (err) {
        console.log('Failed to load from backend, using localStorage:', err);
      }
    }
    
    // Fallback to localStorage if backend fetch fails or no user ID
    if (user.fullName) {
      setUserName(user.fullName);
    }
    if (user.profilePicture) {
      if (user.profilePicture === 'athenor-male-pfp') {
        setProfilePicture(maleProfilePic);
      } else if (user.profilePicture === 'athenor-female-pfp') {
        setProfilePicture(femaleProfilePic);
      } else if (user.profilePicture === 'fetch-from-backend') {
        // Large image stored on backend - show default until backend loads
        setProfilePicture(maleProfilePic);
      } else if (user.profilePicture.startsWith('data:')) {
        setProfilePicture(user.profilePicture);
      } else {
        setProfilePicture(maleProfilePic);
      }
    } else {
      // Set default profile picture if none exists
      setProfilePicture(maleProfilePic);
    }
    if (typeof user.optOutReviews === 'boolean') {
      setOptOutReviews(user.optOutReviews);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserData();
    
    // Listen for storage changes (real-time sync across tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 2MB for better compatibility)
      if (file.size > 2 * 1024 * 1024) {
        showModal(
          'Image Too Large', 
          `Your image is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please choose an image smaller than 2MB to avoid storage issues. You can compress your image using online tools like TinyPNG or Squoosh.`, 
          'warning'
        );
        e.target.value = ''; // Reset the file input
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Also check the base64 size (it's ~33% larger than the file)
        const base64Size = reader.result.length;
        if (base64Size > 3 * 1024 * 1024) { // 3MB base64 limit
          showModal(
            'Image Too Large After Processing', 
            'The image is too large after processing. Please choose a smaller image (under 2MB) or use a lower resolution.', 
            'warning'
          );
          e.target.value = '';
          return;
        }
        setPendingProfilePicture(reader.result);
        setHasUnsavedPicture(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfilePicture = async () => {
    if (!pendingProfilePicture) return;
    
    setSavingPicture(true);
    const pictureToSave = pendingProfilePicture;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Save to backend FIRST if user exists
      if (user.id) {
        console.log('Saving profile picture to backend for user:', user.id);
        const response = await api.put(`/api/Users/${user.id}/profile-picture`, { profilePicture: pictureToSave });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to save profile picture to backend:', errorText);
          showModal('Upload Failed', 'Failed to save profile picture. Please try again.', 'error');
          setSavingPicture(false);
          return;
        }
        
        const result = await response.json();
        console.log('Profile picture saved to backend successfully:', result);
      } else {
        console.warn('No user ID found, cannot save to backend');
      }
      
      // Update localStorage - but DON'T store large base64 images (localStorage has 5MB limit)
      // Base64 encoding adds ~33% overhead, so a 4MB image becomes ~5.3MB and exceeds quota
      // Only store small images or preset names in localStorage
      const isLargeImage = pictureToSave.startsWith('data:') && pictureToSave.length > 500000; // ~500KB limit for localStorage
      
      if (isLargeImage) {
        // For large images, store a marker that tells us to fetch from backend
        user.profilePicture = 'fetch-from-backend';
        console.log('Large image detected, storing marker instead of base64 in localStorage');
      } else {
        user.profilePicture = pictureToSave;
      }
      
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (storageError) {
        // If localStorage still fails, just store the marker
        console.warn('localStorage quota exceeded, storing minimal data:', storageError);
        user.profilePicture = 'fetch-from-backend';
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Update state with the actual image (we have it in memory)
      setProfilePicture(pictureToSave);
      setPendingProfilePicture('');
      setHasUnsavedPicture(false);
      
      // Trigger storage event for other components to detect change
      window.dispatchEvent(new Event('storage'));
      // Also dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: user }));
      
      // Show success message
      showModal('Success', 'Profile picture saved successfully!', 'success');
      
    } catch (err) {
      console.error('Failed to save profile picture:', err);
      showModal('Upload Failed', 'Failed to save profile picture: ' + err.message, 'error');
    } finally {
      setSavingPicture(false);
    }
  };

  const handleOptOutToggle = async () => {
    const newOptOut = !optOutReviews;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Try to save to backend FIRST if user exists in database
    if (user.id) {
      try {
        const response = await api.put(`/api/Users/${user.id}/opt-out`, { optOutReviews: newOptOut });
        
        if (!response.ok) {
          console.error('Failed to update opt-out status on backend');
          showModal('Update Failed', 'Failed to update setting. Please try again.', 'error');
          return;
        }
        console.log('Opt-out status saved to backend successfully');
      } catch (err) {
        console.error('Backend save error:', err);
        showModal('Update Failed', 'Failed to update setting. Please try again.', 'error');
        return;
      }
    }
    
    // Now update state and localStorage after successful backend save
    setOptOutReviews(newOptOut);
    user.optOutReviews = newOptOut;
    localStorage.setItem('user', JSON.stringify(user));
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    // Also dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: user }));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50'}`}>
      {/* NAVBAR */}
      <NavBar title="Settings" showBackButton={true} onBackClick={() => navigate(-1)} />

      {/* MAIN CONTENT */}
      <section className="w-full py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <p className={`mb-8 animate-slideInDown ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your preferences and account settings
          </p>

          {/* PROFILE PICTURE SECTION */}
          <div className={`rounded-xl p-6 shadow-lg mb-6 animate-slideInUp animate-stagger-1 ${
            isDarkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Profile Picture
            </h2>
            
            <div className="flex items-start gap-6">
              {isLoading ? (
                <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
              ) : (
                <div className="relative">
                  <img 
                    src={
                      pendingProfilePicture === 'athenor-male-pfp' ? maleProfilePic :
                      pendingProfilePicture === 'athenor-female-pfp' ? femaleProfilePic :
                      pendingProfilePicture || profilePicture
                    } 
                    alt="Profile" 
                    className={`w-24 h-24 rounded-full object-cover border-2 ${
                      hasUnsavedPicture 
                        ? 'border-amber-500 ring-2 ring-amber-500/50' 
                        : 'border-gray-400'
                    }`}
                  />
                  {hasUnsavedPicture && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex gap-3 flex-wrap">
                  <label htmlFor="pfp-upload" className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95 inline-block ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                  }`}>
                    Upload Custom
                  </label>
                  <input
                    id="pfp-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    style={{ display: 'none' }}
                  />
                  
                  {hasUnsavedPicture && (
                    <button
                      onClick={handleSaveProfilePicture}
                      disabled={savingPicture}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                        savingPicture
                          ? 'opacity-70 cursor-not-allowed'
                          : ''
                      } ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg text-white'
                      }`}
                    >
                      {savingPicture ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Picture'
                      )}
                    </button>
                  )}
                </div>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userName}
                </p>
                {hasUnsavedPicture && (
                  <p className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    ⚠ You have unsaved changes. Click "Save Picture" to apply.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* DARK MODE TOGGLE */}
          <div className={`rounded-xl p-6 shadow-lg mb-6 animate-slideInUp animate-stagger-2 ${
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

          {/* DISABLE EFFECTS TOGGLE */}
          <div className={`rounded-xl p-6 shadow-lg mb-6 animate-slideInUp animate-stagger-2 ${
            isDarkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Disable Effects
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Turn off particle animations and 3D effects for better performance
                </p>
              </div>

              {/* TOGGLE SWITCH */}
              <button
                onClick={toggleDisableEffects}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  disableEffects
                    ? 'bg-emerald-600'
                    : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    disableEffects ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* OPT OUT OF REVIEWS */}
          <div className={`rounded-xl p-6 shadow-lg mb-6 animate-slideInUp animate-stagger-4 ${
            isDarkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Opt Out of Reviews
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Hide your star ratings in the reviews section while keeping your profile picture
                </p>
              </div>

              {/* TOGGLE SWITCH */}
              <button
                onClick={handleOptOutToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  optOutReviews
                    ? 'bg-emerald-600'
                    : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    optOutReviews ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* CURRENT STATUS */}
          <div className={`rounded-xl p-6 animate-slideInUp animate-stagger-5 ${
            isDarkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-gradient-to-br from-blue-100 to-emerald-100 border border-blue-200'
          }`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-semibold">Current Theme:</span> {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </p>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-semibold">Effects:</span> {disableEffects ? 'Disabled' : 'Enabled'}
            </p>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-semibold">Review Status:</span> {optOutReviews ? 'Opted Out' : 'Visible'}
            </p>
          </div>
        </div>
      </section>
      
      {/* Modal for alerts */}
      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
