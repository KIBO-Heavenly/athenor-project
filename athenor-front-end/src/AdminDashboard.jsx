import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import Modal from './Modal';
import NavBar from './NavBar';
import { API_URL } from './config';
import ParticleBackground from './components/ParticleBackground';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("error");
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [dataTitle, setDataTitle] = useState("");
  const [pendingData, setPendingData] = useState(null);

  const handleImportData = () => {
    setTitleModalOpen(true);
  };

  const handleTitleSubmit = () => {
    if (!dataTitle.trim()) {
      setModalTitle("Title Required");
      setModalMessage("Please enter a title for your datasheet.");
      setModalType("error");
      setModalOpen(true);
      return;
    }
    
    setTitleModalOpen(false);
    const fileInput = document.getElementById('fileUpload');
    fileInput.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/dataimport/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setModalTitle("Upload Error");
        setModalMessage(errorData.message || 'Failed to upload file');
        setModalType("error");
        setModalOpen(true);
        setUploading(false);
        return;
      }

      const result = await response.json();
      console.log('File uploaded successfully:', result);

      // Navigate to the ImportedData page with the data and title
      navigate('/imported-data', {
        state: {
          headers: result.headers,
          data: result.data,
          totalRows: result.totalRows,
          title: dataTitle
        }
      });
      
      // Reset title for next upload
      setDataTitle("");
    } catch (err) {
      setModalTitle("Error");
      setModalMessage('Error uploading file: ' + err.message);
      setModalType("error");
      setModalOpen(true);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <>
      {/* Particle Background */}
      <ParticleBackground isDarkMode={isDarkMode} />
      
      <div className="min-h-screen relative">

        {/* NAVBAR */}
        <NavBar title="Athenor" />

        {/* HERO SECTION */}
        <section className={`w-full ${
          isDarkMode
            ? 'bg-transparent'
            : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-28 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className={`text-5xl font-bold leading-tight tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome to Athenor
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-lg mt-6 max-w-2xl mx-auto leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Your all-in-one platform for managing tutoring schedules, assignments, and team coordination. Streamline your workflow and focus on what matters most.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <input
                id="fileUpload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <motion.button 
                whileHover={{ scale: uploading ? 1 : 1.05 }}
                whileTap={{ scale: uploading ? 1 : 0.95 }}
                onClick={handleImportData}
                disabled={uploading}
                className={`px-8 py-3 rounded-xl shadow transition-all duration-300 font-medium ${
                  uploading
                    ? 'opacity-70 cursor-not-allowed'
                    : ''
                } ${
                  isDarkMode
                    ? uploading ? 'bg-gray-700 text-gray-400' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                    : uploading ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
                }`}>
                {uploading ? 'Uploading...' : 'Import Data'}
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
              }`}
              onClick={() => navigate('/word-document-upload')}>
                Upload Availability Form
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
              }`}
              onClick={() => navigate('/assign-tutors')}>
                Assign Times
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
              }`}
              onClick={() => navigate('/master-schedule')}>
                Master Schedule
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
              }`}
              onClick={() => navigate('/manage-users')}>
                Manage Users
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
              }`}
              onClick={() => navigate('/see-reviews')}>
                My Reviews
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Title Modal */}
      {titleModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn" onClick={() => setTitleModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className={`backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border animate-scaleIn ${
              isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/95 border-cyan-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Title for your datasheet
              </h2>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Ex. "College Algebra" for the name of the course
              </p>
              <input
                type="text"
                value={dataTitle}
                onChange={(e) => setDataTitle(e.target.value)}
                placeholder="Enter title..."
                className={`w-full border rounded-lg px-4 py-3 mb-6 transition-all focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                    : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setTitleModalOpen(false)}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTitleSubmit}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isDarkMode
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
