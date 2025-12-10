import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from './config';
import maleProfilePic from './assets/athenor-male-pfp.jpg';
import femaleProfilePic from './assets/athenor-female-pfp.jpg';
import logo from './assets/Athenor_LOGO.png';
import ParticleBackground from './components/ParticleBackground';

export default function PublicReviews() {
  const navigate = useNavigate();
  const { tutorId } = useParams();
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortLastNameFirst, setSortLastNameFirst] = useState(false);

  // Dark mode state (default dark for public page)
  const [isDarkMode] = useState(true);

  // Fetch all tutors
  useEffect(() => {
    fetchTutors();
  }, []);

  // If tutorId is in URL, fetch that tutor
  useEffect(() => {
    if (tutorId) {
      fetchTutorDetails(tutorId);
    }
  }, [tutorId]);

  // Filter tutors when search term changes
  useEffect(() => {
    let sorted = [...tutors];
    
    // Sort alphabetically
    sorted.sort((a, b) => {
      if (sortLastNameFirst) {
        const aLast = a.fullName.split(' ').pop() || '';
        const bLast = b.fullName.split(' ').pop() || '';
        return aLast.localeCompare(bLast);
      }
      return a.fullName.localeCompare(b.fullName);
    });
    
    // Filter by search
    if (searchTerm.trim()) {
      sorted = sorted.filter(t => 
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTutors(sorted);
  }, [tutors, searchTerm, sortLastNameFirst]);

  const fetchTutors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/Reviews/tutors`);
      if (response.ok) {
        const data = await response.json();
        setTutors(data);
        setFilteredTutors(data);
      }
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/Reviews/tutor/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTutor(data);
      }
    } catch (err) {
      console.error('Failed to fetch tutor details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTutor = (tutor) => {
    navigate(`/reviews/${tutor.id}`);
  };

  const handleBackToList = () => {
    setSelectedTutor(null);
    setShowReviewForm(false);
    navigate('/reviews');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (rating === 0) {
      setErrorMessage('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/Reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: selectedTutor.id,
          rating,
          comment,
          reviewerName: 'Anonymous' // Always anonymous
        })
      });

      if (response.ok) {
        setSuccessMessage('Thank you for your feedback!');
        setRating(0);
        setComment('');
        setShowReviewForm(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setErrorMessage('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getProfilePic = (profilePicture) => {
    if (!profilePicture) return maleProfilePic;
    if (profilePicture === 'athenor-female-pfp') return femaleProfilePic;
    if (profilePicture === 'athenor-male-pfp') return maleProfilePic;
    if (profilePicture.startsWith('data:')) return profilePicture;
    return maleProfilePic;
  };

  const renderStars = (count, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            className={`text-2xl transition-all ${interactive ? 'cursor-pointer hover:scale-110' : ''} ${
              star <= (interactive ? (hoverRating || rating) : count)
                ? 'text-yellow-400'
                : 'text-gray-500'
            }`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <ParticleBackground isDarkMode={isDarkMode} />
      
      <div className="min-h-screen relative">
        {/* Header */}
        <header className="py-6 px-6 backdrop-blur-sm bg-gray-900/30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.img 
              src={logo} 
              alt="Athenor" 
              className="h-20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            />
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-white"
            >
              Leave Feedback
            </motion.h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center h-64"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </motion.div>
            ) : selectedTutor ? (
              /* Tutor Detail View - Submit Review */
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Back Button */}
                <button
                  onClick={handleBackToList}
                  className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span>←</span> Back to all
                </button>

                {/* Tutor Profile Card */}
                <div className="backdrop-blur-md bg-gray-800/60 rounded-2xl p-8 border border-gray-700 mb-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img
                      src={getProfilePic(selectedTutor.profilePicture)}
                      alt={selectedTutor.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500"
                    />
                    <div className="text-center md:text-left flex-1">
                      <h2 className="text-3xl font-bold text-white mb-4">
                        {selectedTutor.fullName}
                      </h2>
                      <p className="text-gray-400 mb-4">
                        Leave anonymous feedback for this person
                      </p>
                      {!showReviewForm && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowReviewForm(true)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-cyan-700 transition-all"
                        >
                          Leave Feedback
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500 rounded-lg text-emerald-400 text-center"
                  >
                    {successMessage}
                  </motion.div>
                )}

                {/* Review Form */}
                <AnimatePresence>
                  {showReviewForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="backdrop-blur-md bg-gray-800/60 rounded-2xl p-8 border border-gray-700"
                    >
                      <h3 className="text-2xl font-bold text-white mb-6">
                        Your Feedback (Anonymous)
                      </h3>
                      
                      <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div>
                          <label className="block text-gray-300 mb-3">Rating *</label>
                          {renderStars(rating, true)}
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-2">Comment (optional)</label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                          />
                        </div>

                        <p className="text-gray-500 text-sm">
                          Your feedback is completely anonymous and helps improve our services.
                        </p>

                        {errorMessage && (
                          <p className="text-red-400 text-sm">{errorMessage}</p>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                          >
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Tutors Grid View */
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-400 mb-6 text-center"
                >
                  Select someone to leave anonymous feedback
                </motion.p>

                {/* Search and Sort Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => setSortLastNameFirst(!sortLastNameFirst)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      sortLastNameFirst
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800/60 border border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {sortLastNameFirst ? 'Last Name First ✓' : 'Last Name First'}
                  </button>
                </div>

                {filteredTutors.length === 0 ? (
                  <div className="backdrop-blur-md bg-gray-800/40 rounded-xl p-12 text-center border border-gray-700">
                    <p className="text-gray-400 text-lg">
                      {searchTerm ? 'No results found.' : 'No one available at this time.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTutors.map((tutor, index) => (
                      <motion.div
                        key={tutor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        onClick={() => handleSelectTutor(tutor)}
                        className="backdrop-blur-md bg-gray-800/60 rounded-2xl p-6 border border-gray-700 cursor-pointer hover:border-emerald-500 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={getProfilePic(tutor.profilePicture)}
                            alt={tutor.fullName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-white">{tutor.fullName}</h3>
                            <p className="text-sm text-emerald-400">Click to leave feedback</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 text-center text-gray-500 text-sm">
          <p>© 2025 Athenor Tutoring. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
