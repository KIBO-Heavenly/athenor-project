import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import Modal from './Modal';
import { API_URL } from './config';

export default function TutorScheduleUpload() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [uploadMode, setUploadMode] = useState(null); // 'excel' or 'manual'
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch all schedules on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`${API_URL}/api/Schedule`);
        const data = await response.json();
        
        // Group schedules by tutor
        const grouped = {};
        data.forEach(schedule => {
          if (!grouped[schedule.tutorName]) {
            grouped[schedule.tutorName] = {
              tutorName: schedule.tutorName,
              userId: schedule.userId,
              schedules: {}
            };
          }
          grouped[schedule.tutorName].schedules[schedule.dayOfWeek] = schedule.timeSlot;
        });
        
        // Convert to array for display
        const tutorArray = Object.values(grouped);
        setScheduleData(tutorArray);
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }
    };
    
    if (uploadMode === 'manual') {
      fetchSchedules();
    }
  }, [uploadMode]);

  const handleAddTutor = () => {
    const newTutor = {
      tutorName: 'New Tutor',
      userId: 0,
      schedules: {}
    };
    setScheduleData([...scheduleData, newTutor]);
  };

  const handleDeleteTutor = async (tutorName) => {
    // Find the tutor's userId from the current data
    const tutor = scheduleData.find(t => t.tutorName === tutorName);
    if (!tutor || !tutor.userId) {
      setScheduleData(scheduleData.filter(t => t.tutorName !== tutorName));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/Schedule/tutor/${tutor.userId}/all`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setScheduleData(scheduleData.filter(t => t.tutorName !== tutorName));
        setModalTitle("Success");
        setModalMessage("Tutor schedule deleted successfully!");
        setModalType("success");
        setModalOpen(true);
      }
    } catch (err) {
      console.error('Error deleting tutor schedule:', err);
      setModalTitle("Error");
      setModalMessage("Failed to delete tutor schedule");
      setModalType("error");
      setModalOpen(true);
    }
  };

  const handleUpdateSchedule = (index, day, value) => {
    const updated = [...scheduleData];
    updated[index].schedules[day] = value;
    setScheduleData(updated);
  };

  const handleUpdateName = (index, newName) => {
    const updated = [...scheduleData];
    updated[index].tutorName = newName;
    setScheduleData(updated);
  };

  const handleSaveSchedules = async () => {
    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      for (const tutor of scheduleData) {
        for (const [day, timeSlot] of Object.entries(tutor.schedules)) {
          if (timeSlot && timeSlot.trim()) {
            const response = await fetch(`${API_URL}/api/Schedule`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.id || 0,
                tutorName: tutor.tutorName,
                dayOfWeek: day,
                timeSlot: timeSlot
              })
            });
            
            if (!response.ok) {
              throw new Error('Failed to save schedule');
            }
          }
        }
      }
      
      setModalTitle("Success");
      setModalMessage("All schedules saved successfully!");
      setModalType("success");
      setModalOpen(true);
      
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error saving schedules:', err);
      setModalTitle("Error");
      setModalMessage("Failed to save schedules. Please try again.");
      setModalType("error");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setModalTitle("Info");
      setModalMessage('Excel file upload would be processed here. For now, use manual input mode.');
      setModalType("info");
      setModalOpen(true);
    }
  };

  return (
    <div className={`min-h-screen ${
      isDarkMode
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50'
    }`}>
      {/* NAVBAR */}
      <NavBar showBackButton={true} onBackClick={() => navigate('/admin-dashboard')} />

      {/* MAIN CONTENT */}
      <section className="w-full py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Schedule Management
          </h1>

          {/* MODE SELECTION */}
          {uploadMode === null && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => setUploadMode('excel')}
                className={`p-8 rounded-xl text-center transition ${
                  isDarkMode
                    ? 'bg-gray-800 border border-gray-700 hover:border-emerald-600'
                    : 'bg-white border border-gray-200 hover:border-blue-600'
                }`}
              >
                <div className={`text-4xl mb-4 ${isDarkMode ? 'text-emerald-400' : 'text-blue-600'}`}>
                  📄
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Upload Excel
                </h2>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Upload an Excel file with tutor schedules
                </p>
              </button>

              <button
                onClick={() => setUploadMode('manual')}
                className={`p-8 rounded-xl text-center transition ${
                  isDarkMode
                    ? 'bg-gray-800 border border-gray-700 hover:border-cyan-600'
                    : 'bg-white border border-gray-200 hover:border-cyan-600'
                }`}
              >
                <div className={`text-4xl mb-4 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  ✏️
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Manual Input
                </h2>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Manually enter and manage tutor schedules
                </p>
              </button>
            </div>
          )}

          {/* EXCEL UPLOAD MODE */}
          {uploadMode === 'excel' && (
            <div className={`rounded-xl p-8 ${
              isDarkMode
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Upload Excel File
              </h2>
              
              <div className={`border-2 border-dashed rounded-lg p-12 text-center mb-6 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700/50'
                  : 'border-blue-300 bg-blue-50'
              }`}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className={`text-5xl mb-4 ${isDarkMode ? 'text-emerald-400' : 'text-blue-600'}`}>
                    📁
                  </div>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Click to upload or drag and drop
                  </p>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    XLS, XLSX up to 10MB
                  </p>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setUploadMode(null)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* MANUAL INPUT MODE */}
          {uploadMode === 'manual' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setUploadMode(null)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={handleAddTutor}
                  className={`px-6 py-2 rounded-lg font-medium text-white transition ${
                    isDarkMode
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  + Add Tutor
                </button>
              </div>

              {/* SCHEDULE TABLE */}
              <div className={`rounded-xl shadow-lg overflow-x-auto ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-200'
              }`}>
                <table className="w-full">
                  <thead>
                    <tr className={`${
                      isDarkMode
                        ? 'bg-gray-700 border-b border-gray-600'
                        : 'bg-gray-100 border-b border-gray-200'
                    }`}>
                      <th className={`px-6 py-3 text-left font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Tutor Name
                      </th>
                      {days.map(day => (
                        <th key={day} className={`px-6 py-3 text-left font-semibold text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {day}
                        </th>
                      ))}
                      <th className={`px-6 py-3 text-center font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleData.map((tutor, rowIndex) => (
                      <tr key={rowIndex} className={`border-b ${
                        isDarkMode
                          ? `border-gray-700 ${rowIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`
                          : `border-gray-200 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`
                      }`}>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={tutor.tutorName}
                            onChange={(e) => handleUpdateName(rowIndex, e.target.value)}
                            className={`w-full px-3 py-2 rounded border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </td>
                        {days.map(day => (
                          <td key={`${rowIndex}-${day}`} className="px-6 py-4">
                            <input
                              type="text"
                              value={tutor.schedules[day] || ''}
                              onChange={(e) => handleUpdateSchedule(rowIndex, day, e.target.value)}
                              placeholder="e.g., 9:00 AM - 12:00 PM"
                              className={`w-full px-3 py-2 rounded border text-sm ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteTutor(tutor.tutorName)}
                            className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SAVE BUTTON */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveSchedules}
                  disabled={loading}
                  className={`px-8 py-3 rounded-lg font-medium text-white transition ${
                    isDarkMode
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
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
