import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import Modal from './Modal';
import { API_URL } from './config';
import maleProfilePic from './assets/athenor-male-pfp.jpg';
import femaleProfilePic from './assets/athenor-female-pfp.jpg';

export default function SeeReviews() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      setCurrentUser(user);
      fetchMyReviews(user.id);
    } else {
      setLoading(false);
      setModalTitle("Not Logged In");
      setModalMessage("Please log in to view your reviews.");
      setModalType("warning");
      setModalOpen(true);
    }
  }, []);

  const fetchMyReviews = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/Reviews/tutor/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setModalTitle("Error");
      setModalMessage("Failed to load your reviews.");
      setModalType("error");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!currentUser?.id) return;
    setRefreshing(true);
    await fetchMyReviews(currentUser.id);
    setTimeout(() => setRefreshing(false), 500);
  };

  const getProfilePic = (profilePicture) => {
    if (!profilePicture) return maleProfilePic;
    if (profilePicture === 'athenor-female-pfp') return femaleProfilePic;
    if (profilePicture === 'athenor-male-pfp') return maleProfilePic;
    if (profilePicture.startsWith('data:')) return profilePicture;
    return maleProfilePic;
  };

  const renderStars = (count) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${star <= count ? 'text-amber-400' : 'text-gray-500'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderLargeStars = (count) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-3xl ${star <= count ? 'text-amber-400' : 'text-gray-500'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
        <NavBar title="My Reviews" showBackButton={true} onBackClick={() => navigate('/admin')} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-12 w-12 text-cyan-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
      <NavBar title="My Reviews" showBackButton={true} onBackClick={() => navigate('/admin')} />

      <section className="w-full py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with Profile */}
          <div className={`rounded-2xl p-8 mb-8 shadow-xl animate-slideInDown ${
            isDarkMode
              ? 'bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 border border-emerald-700/50'
              : 'bg-gradient-to-r from-blue-100 to-cyan-100 border border-cyan-200'
          }`}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {currentUser && (
                <img
                  src={getProfilePic(currentUser.profilePicture)}
                  alt={currentUser.fullName}
                  className={`w-28 h-28 rounded-full object-cover border-4 shadow-lg ${
                    isDarkMode ? 'border-emerald-500' : 'border-cyan-400'
                  }`}
                />
              )}
              <div className="text-center md:text-left flex-1">
                <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Your Feedback
                </h1>
                <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  See what students are saying about you
                </p>
                
                {/* Stats Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                  <div className="flex items-center gap-2">
                    {renderLargeStars(Math.round(averageRating))}
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${
                    isDarkMode ? 'bg-cyan-800/50' : 'bg-cyan-200'
                  }`}>
                    <span className={`font-semibold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                      {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                  refreshing ? 'opacity-70 cursor-not-allowed' : ''
                } ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
                }`}
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className={`rounded-2xl p-12 text-center shadow-lg animate-fadeIn ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="text-6xl mb-4">📝</div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Reviews Yet
              </h2>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                When students leave feedback, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Recent Feedback
              </h2>
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl animate-slideInUp ${
                    isDarkMode
                      ? 'bg-gray-800 border border-gray-700 hover:border-cyan-600/50'
                      : 'bg-white border border-gray-200 hover:border-cyan-300'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-cyan-800' : 'bg-cyan-100'
                      }`}>
                        <span className={`text-lg ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'}`}>
                          👤
                        </span>
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Anonymous Student
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  
                  {review.comment ? (
                    <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      "{review.comment}"
                    </p>
                  ) : (
                    <p className={`italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      No written feedback provided
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={modalOpen} title={modalTitle} message={modalMessage} type={modalType} onClose={() => setModalOpen(false)} />
    </div>
  );
}
