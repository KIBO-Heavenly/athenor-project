import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import Modal from './Modal';
import { getUserColor, generateUserColor, BASE_COLORS } from './colorPalette';
import { API_URL } from './config';

export default function ManageTutors() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [oaData, setOaData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastNameFirst, setLastNameFirst] = useState(false);
  const [tutorColors, setTutorColors] = useState({}); // Custom tutor colors
  const [colorPickerOpen, setColorPickerOpen] = useState(null); // Track which tutor's color picker is open

  useEffect(() => {
    // Load custom tutor colors from localStorage
    const savedColors = localStorage.getItem('tutorColors');
    if (savedColors) {
      try {
        setTutorColors(JSON.parse(savedColors));
      } catch (err) {
        console.error('Error loading tutor colors:', err);
      }
    }

    // Load OA data from backend first, fallback to localStorage
    const loadData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/TutorAvailability`);
        if (response.ok) {
          const backendData = await response.json();
          const formattedData = backendData.map(tutor => ({
            tutorName: tutor.tutorName,
            availability: JSON.parse(tutor.availabilityJson),
            id: tutor.id
          }));
          setOaData(formattedData);
          // Save to localStorage for backwards compatibility
          localStorage.setItem('oaAvailability', JSON.stringify(formattedData));
          return;
        }
      } catch (err) {
        console.error('Error loading from backend:', err);
      }
      
      // Fallback to localStorage
      const savedData = localStorage.getItem('oaAvailability');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setOaData(data);
        } catch (err) {
          console.error('Error loading OA data:', err);
          setModalTitle("Error");
          setModalMessage("Could not load Office Assistant data.");
          setModalType("error");
          setModalOpen(true);
        }
      } else {
        setModalTitle("No Data");
        setModalMessage("No Office Assistant data found. Please upload a Word document first.");
        setModalType("warning");
        setModalOpen(true);
      }
    };

    loadData();
  }, []);

  // Get color for a tutor - use custom color if set, otherwise use default
  const getTutorColor = (tutorName) => {
    if (tutorColors[tutorName]) {
      return tutorColors[tutorName];
    }
    return getUserColor(tutorName);
  };

  // Save a custom color for a tutor
  const saveTutorColor = (tutorName, colorIndex) => {
    const newColor = generateUserColor(colorIndex);
    const updatedColors = { ...tutorColors, [tutorName]: newColor };
    setTutorColors(updatedColors);
    localStorage.setItem('tutorColors', JSON.stringify(updatedColors));
    setColorPickerOpen(null);
    setModalTitle("Success");
    setModalMessage("Color updated successfully!");
    setModalType("success");
    setModalOpen(true);
  };

  // Color options for the picker
  const colorOptions = BASE_COLORS.map((_, index) => generateUserColor(index));

  const handleEditStart = (index) => {
    setEditingIndex(index);
    setEditingData({ ...oaData[index] });
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingData(null);
  };

  const handleEditSave = async () => {
    const updated = [...oaData];
    updated[editingIndex] = editingData;
    setOaData(updated);
    localStorage.setItem('oaAvailability', JSON.stringify(updated));
    
    // Also update in backend if tutor has an ID
    if (editingData.id) {
      try {
        await fetch(`${API_URL}/api/TutorAvailability/${editingData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingData.id,
            tutorName: editingData.tutorName,
            availabilityJson: JSON.stringify(editingData.availability)
          })
        });
      } catch (err) {
        console.error('Error updating backend:', err);
      }
    }
    
    setEditingIndex(null);
    setEditingData(null);
    setModalTitle("Success");
    setModalMessage("Office Assistant updated!");
    setModalType("success");
    setModalOpen(true);
  };

  const handleDeleteTutor = async (index) => {
    const tutorName = oaData[index].tutorName;
    const tutorId = oaData[index].id;
    const updated = oaData.filter((_, i) => i !== index);
    setOaData(updated);
    localStorage.setItem('oaAvailability', JSON.stringify(updated));
    
    // Delete from backend
    if (tutorId) {
      try {
        await fetch(`${API_URL}/api/TutorAvailability/${tutorId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Error deleting from backend:', err);
      }
    } else {
      // Try deleting by name if no ID
      try {
        await fetch(`${API_URL}/api/TutorAvailability/name/${encodeURIComponent(tutorName)}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Error deleting from backend by name:', err);
      }
    }
    
    // Also remove from any active assignments (used in AssignTutors page)
    // Handle three-section structure: mathCenter, tutoringCommons, writingCenter
    const existingAssignments = JSON.parse(localStorage.getItem('tutorAssignments') || '{}');
    
    // Check if it's the new three-section structure or old single-section
    const sections = ['mathCenter', 'tutoringCommons', 'writingCenter'];
    const isNewStructure = sections.some(section => existingAssignments[section]);
    
    if (isNewStructure) {
      // New three-section structure
      sections.forEach(section => {
        if (existingAssignments[section]) {
          Object.keys(existingAssignments[section]).forEach(slot => {
            Object.keys(existingAssignments[section][slot]).forEach(day => {
              if (existingAssignments[section][slot][day] === tutorName) {
                existingAssignments[section][slot][day] = null;
              }
            });
          });
        }
      });
    } else {
      // Old single-section structure (backwards compatibility)
      Object.keys(existingAssignments).forEach(slot => {
        if (typeof existingAssignments[slot] === 'object') {
          Object.keys(existingAssignments[slot]).forEach(day => {
            if (existingAssignments[slot][day] === tutorName) {
              existingAssignments[slot][day] = null;
            }
          });
        }
      });
    }
    localStorage.setItem('tutorAssignments', JSON.stringify(existingAssignments));

    // Also remove from backend schedule database (Master Schedule page)
    try {
      await fetch(`${API_URL}/api/Schedule/tutor-name/${encodeURIComponent(tutorName)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error deleting from backend:', err);
    }

    setModalTitle("Deleted");
    setModalMessage(`${tutorName} has been removed from all schedules.`);
    setModalType("success");
    setModalOpen(true);
  };

  const handleNameChange = (newName) => {
    setEditingData({ ...editingData, tutorName: newName });
  };

  if (oaData.length === 0) {
    return (
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
        <NavBar title="See Users" showBackButton={true} onBackClick={() => navigate('/assign-tutors')} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
        <Modal isOpen={modalOpen} title={modalTitle} message={modalMessage} type={modalType} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
      <NavBar title="See Users" showBackButton={true} onBackClick={() => navigate('/assign-tutors')} />

      <section className="w-full py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 animate-slideInDown ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Edit or Delete Tutors/Users
          </h1>

          {/* Search and Sort Controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-cyan-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-cyan-500'
                }`}
              />
            </div>
            <button
              onClick={() => setLastNameFirst(!lastNameFirst)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                lastNameFirst
                  ? isDarkMode
                    ? 'bg-cyan-600 text-white'
                    : 'bg-cyan-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lastNameFirst ? '✓ Last Name First' : 'Last Name First'}
            </button>
          </div>

          <div className="grid gap-6">
            {oaData
              .map((tutor, originalIndex) => ({ tutor, originalIndex }))
              .filter(({ tutor }) => 
                tutor.tutorName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => {
                const nameA = a.tutor.tutorName;
                const nameB = b.tutor.tutorName;
                
                if (lastNameFirst) {
                  const lastNameA = nameA.split(' ').pop().toLowerCase();
                  const lastNameB = nameB.split(' ').pop().toLowerCase();
                  return lastNameA.localeCompare(lastNameB);
                } else {
                  return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                }
              })
              .map(({ tutor, originalIndex }) => {
              const userColor = getTutorColor(tutor.tutorName);
              const isEditing = editingIndex === originalIndex;
              const dataToDisplay = isEditing ? editingData : tutor;

              return (
                <div
                  key={originalIndex}
                  className={`rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl animate-slideInUp ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                  style={{
                    borderLeftColor: isDarkMode ? userColor.dark : userColor.light,
                    borderLeftWidth: '6px',
                    animationDelay: `${originalIndex * 0.1}s`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <div className={`p-6 ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-4">
                      {/* Name and Color Display */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div
                            className="w-16 h-16 rounded-lg shadow cursor-pointer hover:opacity-80 transition"
                            style={{
                              backgroundColor: isDarkMode ? userColor.dark : userColor.light
                            }}
                            onClick={() => setColorPickerOpen(colorPickerOpen === originalIndex ? null : originalIndex)}
                            title="Click to change color"
                          />
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={dataToDisplay.tutorName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className={`text-2xl font-bold px-3 py-1 rounded border-2 ${
                              isDarkMode
                                ? 'bg-gray-800 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        ) : (
                          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {dataToDisplay.tutorName}
                          </h2>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => handleEditStart(originalIndex)}
                              className={`px-4 py-2 rounded font-medium transition ${
                                isDarkMode
                                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700'
                                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTutor(originalIndex)}
                              className={`px-4 py-2 rounded font-medium transition border ${
                                isDarkMode
                                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50'
                                  : 'border-gray-400 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleEditSave}
                              className={`px-4 py-2 rounded font-medium transition ${
                                isDarkMode
                                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                                  : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:shadow-lg'
                              }`}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className={`px-4 py-2 rounded font-medium transition border ${
                                isDarkMode
                                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50'
                                  : 'border-gray-400 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Availability Summary - Removed, just show count */}
                    {!isEditing && (
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p className="font-semibold">
                          {Object.keys(dataToDisplay.availability).filter(slot => 
                            Object.values(dataToDisplay.availability[slot]).some(v => v)
                          ).length} available time slots
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={() => navigate('/admin')}
              className={`px-6 py-3 rounded-lg font-medium transition border ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50'
                  : 'border-cyan-400 text-gray-700 hover:bg-white/50'
              }`}
            >
              Back to Admin
            </button>
          </div>
        </div>
      </section>

      {/* Color Picker Modal */}
      {colorPickerOpen !== null && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setColorPickerOpen(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Choose Color for {filteredAndSortedData[colorPickerOpen]?.tutorName}
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This color will be used across all pages and will be saved for all users.
              </p>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {colorOptions.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => saveTutorColor(filteredAndSortedData[colorPickerOpen].tutorName, idx)}
                    className="w-full aspect-square rounded-lg hover:scale-110 transition-transform shadow-md hover:shadow-xl"
                    style={{
                      backgroundColor: isDarkMode ? color.dark : color.light
                    }}
                    title={`Color ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setColorPickerOpen(null)}
                className={`w-full py-2 rounded-lg font-medium transition ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} title={modalTitle} message={modalMessage} type={modalType} onClose={() => setModalOpen(false)} />
    </div>
  );
}
