import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import Modal from './Modal';
import { API_URL } from './config';
import { getUserColor, generateUserColor, BASE_COLORS } from './colorPalette';

export default function AssignTutors() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [oaData, setOaData] = useState([]);
  const [assignments, setAssignments] = useState({ mathCenter: {}, tutoringCommons: {}, writingCenter: {} });
  const [activeSection, setActiveSection] = useState('mathCenter'); // 'mathCenter', 'tutoringCommons', 'writingCenter'
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const [tutorColors, setTutorColors] = useState({}); // Custom tutor colors
  const [colorPickerOpen, setColorPickerOpen] = useState(null); // Track which tutor's color picker is open
  const [assignmentPopup, setAssignmentPopup] = useState(null); // { timeSlot, day } for multi-person assignment popup
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // Track sidebar expansion
  const [showArchive, setShowArchive] = useState(false); // Track calendar archive modal
  const [archivedWeeks, setArchivedWeeks] = useState([]); // Store archived weeks
  const [hourWarnings, setHourWarnings] = useState({}); // Track tutors exceeding 19 hours
  const [calendarConfig] = useState({
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeSlots: [
      '10:00 – 10:30 AM', '10:30 – 11:00 AM', '11:00 – 11:30 AM', '11:30 – 12:00 PM', '12:00 – 12:30 PM',
      '12:30 – 1:00 PM', '1:00 – 1:30 PM', '1:30 – 2:00 PM', '2:00 – 2:30 PM', '2:30 – 3:00 PM',
      '3:00 – 3:30 PM', '3:30 – 4:00 PM', '4:00 – 4:30 PM', '4:30 – 5:00 PM', '5:00 – 5:30 PM',
      '5:30 – 6:00 PM', '6:00 – 6:30 PM', '6:30 – 7:00 PM', '7:00 – 7:30 PM'
    ]
  });

  const timeSlots = calendarConfig.timeSlots;
  const days = calendarConfig.days;

  const sections = {
    mathCenter: 'Math Learning Center',
    tutoringCommons: 'Tutoring Commons',
    writingCenter: 'Writing Center'
  };

  // Helper function to get the current week's dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate Monday of current week
    const monday = new Date(today);
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days, else go to Monday
    monday.setDate(today.getDate() + diff);
    
    // Generate array of dates for Mon-Fri
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  };

  const weekDates = getWeekDates();

  // Format date for display with month name
  const formatDate = (date) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Get current year
  const currentYear = new Date().getFullYear();

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

    // Load calendar configuration from localStorage
    const savedCalendarConfig = localStorage.getItem('calendarConfig');
    if (savedCalendarConfig) {
      try {
        setCalendarConfig(JSON.parse(savedCalendarConfig));
      } catch (err) {
        console.error('Error loading calendar config:', err);
      }
    }

    // Load archived weeks from localStorage or initialize with dummy data
    const savedArchives = localStorage.getItem('archivedWeeks');
    let shouldInitialize = false;
    
    if (savedArchives) {
      try {
        const parsed = JSON.parse(savedArchives);
        // Check if it's empty or invalid
        if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
          shouldInitialize = true;
        } else {
          setArchivedWeeks(parsed);
        }
      } catch (err) {
        console.error('Error loading archived weeks:', err);
        shouldInitialize = true;
      }
    } else {
      shouldInitialize = true;
    }
    
    if (shouldInitialize) {
      // Initialize with dummy data for the week prior (excluding John Doe)
      const dummyUsers = ['Antonio', 'Marcelo', 'Randy'];
      const dummyArchives = [];
      
      // Create week prior to this one
      const weekOffset = 1;
      const today = new Date();
      const pastMonday = new Date(today);
      const currentDay = today.getDay();
      const diff = currentDay === 0 ? -6 : 1 - currentDay;
      pastMonday.setDate(today.getDate() + diff - (weekOffset * 7));
      
      const weekDates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(pastMonday);
        date.setDate(pastMonday.getDate() + i);
        weekDates.push(date);
      }
      
      const formatArchiveDate = (date) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[date.getMonth()]} ${date.getDate()}`;
      };
      
      // Generate random hours for each user (10-19 hours)
      const tutorHours = {};
      dummyUsers.forEach(user => {
        tutorHours[user] = Math.floor(Math.random() * 10) + 10;
      });
      
      dummyArchives.push({
        id: Date.now() - (weekOffset * 1000000),
        startDate: formatArchiveDate(weekDates[0]),
        endDate: formatArchiveDate(weekDates[4]),
        year: weekDates[0].getFullYear(),
        assignments: { mathCenter: {}, tutoringCommons: {}, writingCenter: {} },
        tutorHours: tutorHours,
        timestamp: new Date(pastMonday).toISOString()
      });
      
      setArchivedWeeks(dummyArchives);
      localStorage.setItem('archivedWeeks', JSON.stringify(dummyArchives));
    }
    
    // Load OA availability data from localStorage
    const savedData = localStorage.getItem('oaAvailability');
    console.log('Attempting to load oaAvailability:', savedData);
    
    // Try loading from backend first
    const loadFromBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/api/TutorAvailability`);
        if (response.ok) {
          const backendData = await response.json();
          const formattedData = backendData.map(tutor => ({
            tutorName: tutor.tutorName,
            availability: JSON.parse(tutor.availabilityJson)
          }));
          console.log('Successfully loaded OA data from backend:', formattedData);
          setOaData(formattedData);
          // Also save to localStorage for backwards compatibility
          localStorage.setItem('oaAvailability', JSON.stringify(formattedData));
          return formattedData;
        }
      } catch (err) {
        console.error('Error loading from backend, falling back to localStorage:', err);
      }
      
      // Fallback to localStorage if backend fails
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          console.log('Loaded from localStorage:', data);
          setOaData(data);
          return data;
        } catch (err) {
          console.error('Error loading OA data:', err);
          setModalTitle("Error");
          setModalMessage("Could not load Tutor/User availability data. Please upload a document first.");
          setModalType("error");
          setModalOpen(true);
        }
      } else {
        console.log('No oaAvailability found in localStorage');
        setModalTitle("No Data");
        setModalMessage("No Tutor/User availability data found. Please upload a Word document first.");
        setModalType("warning");
        setModalOpen(true);
      }
      return null;
    };
    
    loadFromBackend().then(data => {
      if (!data || data.length === 0) return;
        
        // Initialize assignments object for all three sections
        const initialAssignments = {
          mathCenter: {},
          tutoringCommons: {},
          writingCenter: {}
        };
        
        ['mathCenter', 'tutoringCommons', 'writingCenter'].forEach(section => {
          timeSlots.forEach(slot => {
            initialAssignments[section][slot] = {};
            days.forEach(day => {
              initialAssignments[section][slot][day] = []; // Changed from null to array for multi-person assignment
            });
          });
        });
        
        // Load saved assignments from localStorage if they exist
        const savedAssignments = localStorage.getItem('tutorAssignments');
        if (savedAssignments) {
          try {
            const loadedAssignments = JSON.parse(savedAssignments);
            
            // Merge loaded assignments for each section with backward compatibility
            Object.keys(loadedAssignments).forEach(section => {
              if (initialAssignments[section]) {
                Object.keys(loadedAssignments[section]).forEach(timeSlot => {
                  Object.keys(loadedAssignments[section][timeSlot]).forEach(day => {
                    const value = loadedAssignments[section][timeSlot][day];
                    // Convert old single-tutor format (string) to new multi-tutor format (array)
                    if (typeof value === 'string' && value !== null) {
                      initialAssignments[section][timeSlot][day] = [value];
                    } else if (Array.isArray(value)) {
                      initialAssignments[section][timeSlot][day] = value;
                    } else {
                      initialAssignments[section][timeSlot][day] = [];
                    }
                  });
                });
              }
            });
            
            console.log('Loaded existing assignments:', loadedAssignments);
          } catch (err) {
            console.error('Error loading assignments:', err);
          }
        }
        
        setAssignments(initialAssignments);
    });
  }, []);

  // Calculate total hours for each tutor across all sections
  const calculateTutorHours = () => {
    const tutorHours = {};
    
    Object.keys(assignments).forEach(section => {
      Object.keys(assignments[section]).forEach(timeSlot => {
        Object.keys(assignments[section][timeSlot]).forEach(day => {
          const tutorNames = assignments[section][timeSlot][day];
          if (Array.isArray(tutorNames)) {
            tutorNames.forEach(tutorName => {
              if (!tutorHours[tutorName]) {
                tutorHours[tutorName] = 0;
              }
              // Each time slot is 30 minutes = 0.5 hours
              tutorHours[tutorName] += 0.5;
            });
          }
        });
      });
    });
    
    return tutorHours;
  };

  // Check for tutors exceeding 19 hours in real-time
  useEffect(() => {
    const tutorHours = calculateTutorHours();
    const warnings = {};
    
    Object.keys(tutorHours).forEach(tutorName => {
      if (tutorHours[tutorName] > 19) {
        warnings[tutorName] = tutorHours[tutorName];
      }
    });
    
    setHourWarnings(warnings);
  }, [assignments]);

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
  };

  // Color options for the picker
  const colorOptions = BASE_COLORS.map((_, index) => generateUserColor(index));

  const getAvailableOAs = (timeSlot, day) => {
    const availableOAs = oaData.filter(oa => {
      return oa.availability[timeSlot] && oa.availability[timeSlot][day];
    });
    
    // Deduplicate by tutor name
    const uniqueOAs = [];
    const seenNames = new Set();
    for (const oa of availableOAs) {
      if (!seenNames.has(oa.tutorName)) {
        seenNames.add(oa.tutorName);
        uniqueOAs.push(oa);
      }
    }
    
    // Filter out tutors already assigned to this time slot in ANY section
    const filteredOAs = uniqueOAs.filter(oa => {
      const sections = ['mathCenter', 'tutoringCommons', 'writingCenter'];
      for (const section of sections) {
        const assigned = assignments[section]?.[timeSlot]?.[day];
        if (Array.isArray(assigned) && assigned.includes(oa.tutorName)) {
          return false; // This tutor is already assigned somewhere
        }
      }
      return true;
    });
    
    return filteredOAs;
  };

  const checkConflict = (timeSlot, day, oaName, currentSection) => {
    // Check if this tutor is already assigned to the same time slot in a different section
    const sections = ['mathCenter', 'tutoringCommons', 'writingCenter'];
    for (const section of sections) {
      const assigned = assignments[section]?.[timeSlot]?.[day];
      if (section !== currentSection && Array.isArray(assigned) && assigned.includes(oaName)) {
        return section;
      }
    }
    return null;
  };

  const assignOA = (timeSlot, day, oaName) => {
    // Check for scheduling conflicts
    const conflict = checkConflict(timeSlot, day, oaName, activeSection);
    if (conflict) {
      const sectionNames = {
        mathCenter: 'Math Learning Center',
        tutoringCommons: 'Tutoring Commons',
        writingCenter: 'Writing Center'
      };
      setModalTitle("Scheduling Conflict");
      setModalMessage(`${oaName} is already assigned to ${sectionNames[conflict]} at ${timeSlot} on ${day}. Please choose a different tutor or remove the existing assignment.`);
      setModalType("warning");
      setModalOpen(true);
      return;
    }

    const currentAssigned = assignments[activeSection]?.[timeSlot]?.[day] || [];
    
    // Check if already assigned
    if (currentAssigned.includes(oaName)) {
      return; // Already assigned, do nothing
    }
    
    // Check if we've reached the limit of 4 people
    if (currentAssigned.length >= 4) {
      setModalTitle("Assignment Limit");
      setModalMessage("Maximum of 4 people can be assigned to the same time slot.");
      setModalType("warning");
      setModalOpen(true);
      return;
    }

    // Check if this assignment would exceed 19 hours
    const tutorHours = calculateTutorHours();
    const currentHours = tutorHours[oaName] || 0;
    const newHours = currentHours + 0.5; // Each slot is 30 minutes
    
    if (newHours > 19) {
      setModalTitle("⚠️ Hour Limit Warning");
      setModalMessage(`Warning: Assigning ${oaName} to this slot will result in ${newHours} hours, exceeding the 19-hour limit. Current hours: ${currentHours}. Do you want to proceed anyway?`);
      setModalType("warning");
      setModalOpen(true);
      // Still allow the assignment to proceed
    }

    const updatedAssignments = {
      ...assignments,
      [activeSection]: {
        ...assignments[activeSection],
        [timeSlot]: {
          ...assignments[activeSection][timeSlot],
          [day]: [...currentAssigned, oaName]
        }
      }
    };
    setAssignments(updatedAssignments);
    // Save to localStorage immediately
    localStorage.setItem('tutorAssignments', JSON.stringify(updatedAssignments));
  };

  const clearAssignment = (timeSlot, day) => {
    const updatedAssignments = {
      ...assignments,
      [activeSection]: {
        ...assignments[activeSection],
        [timeSlot]: {
          ...assignments[activeSection][timeSlot],
          [day]: []
        }
      }
    };
    setAssignments(updatedAssignments);
    // Save to localStorage immediately
    localStorage.setItem('tutorAssignments', JSON.stringify(updatedAssignments));
  };

  const removeSpecificTutor = (timeSlot, day, tutorName) => {
    const currentAssigned = assignments[activeSection]?.[timeSlot]?.[day] || [];
    const updatedAssignments = {
      ...assignments,
      [activeSection]: {
        ...assignments[activeSection],
        [timeSlot]: {
          ...assignments[activeSection][timeSlot],
          [day]: currentAssigned.filter(name => name !== tutorName)
        }
      }
    };
    setAssignments(updatedAssignments);
    localStorage.setItem('tutorAssignments', JSON.stringify(updatedAssignments));
  };

  const handleClearAll = () => {
    // Clear all assignments for all sections
    const clearedAssignments = {
      mathCenter: {},
      tutoringCommons: {},
      writingCenter: {}
    };
    
    ['mathCenter', 'tutoringCommons', 'writingCenter'].forEach(section => {
      timeSlots.forEach(slot => {
        clearedAssignments[section][slot] = {};
        days.forEach(day => {
          clearedAssignments[section][slot][day] = [];
        });
      });
    });
    
    setAssignments(clearedAssignments);
    localStorage.setItem('tutorAssignments', JSON.stringify(clearedAssignments));
    
    setModalTitle("Cleared");
    setModalMessage("All assignments have been cleared from the schedule.");
    setModalType("success");
    setModalOpen(true);
  };

  const archiveCurrentWeek = () => {
    const tutorHours = calculateTutorHours();
    const weekDatesForArchive = getWeekDates();
    
    const archiveEntry = {
      id: Date.now(),
      startDate: formatDate(weekDatesForArchive[0]),
      endDate: formatDate(weekDatesForArchive[4]),
      year: currentYear,
      assignments: JSON.parse(JSON.stringify(assignments)), // Deep copy
      tutorHours: tutorHours,
      timestamp: new Date().toISOString()
    };
    
    const updatedArchives = [...archivedWeeks, archiveEntry];
    setArchivedWeeks(updatedArchives);
    localStorage.setItem('archivedWeeks', JSON.stringify(updatedArchives));
    
    setModalTitle("Success");
    setModalMessage("Current week has been archived successfully!");
    setModalType("success");
    setModalOpen(true);
  };

  const handleSaveAssignments = async () => {
    setLoading(true);
    try {
      // First, clear all existing schedules
      const clearResponse = await fetch(`${API_URL}/api/Schedule/clear-all`, {
        method: 'DELETE',
      });

      if (!clearResponse.ok) {
        console.error('Failed to clear existing schedules');
      }

      // Flatten assignments into schedule entries with section information
      const scheduleEntries = [];
      
      Object.keys(assignments).forEach(section => {
        Object.keys(assignments[section]).forEach(timeSlot => {
          Object.keys(assignments[section][timeSlot]).forEach(day => {
            const tutorNames = assignments[section][timeSlot][day];
            if (Array.isArray(tutorNames) && tutorNames.length > 0) {
              // Create an entry for each tutor assigned to this time slot
              tutorNames.forEach(tutorName => {
                scheduleEntries.push({
                  tutorName,
                  day,
                  timeSlot,
                  section
                });
              });
            }
          });
        });
      });

      // Save all schedule entries to database
      for (const entry of scheduleEntries) {
        const payload = {
          tutorName: entry.tutorName,
          dayOfWeek: entry.day,
          timeSlot: entry.timeSlot,
          section: entry.section,
          userId: JSON.parse(localStorage.getItem('user') || '{}').id || null
        };
        console.log('Saving schedule entry:', payload);
        
        const response = await fetch(`${API_URL}/api/Schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Save failed:', response.status, errorText);
          throw new Error(`Failed to save assignment: ${response.status} - ${errorText}`);
        }
      }

      setModalTitle("Success");
      setModalMessage(`Successfully saved ${scheduleEntries.length} assignments to the master schedule!`);
      setModalType("success");
      setModalOpen(true);
    } catch (err) {
      setModalTitle("Error");
      setModalMessage('Error saving assignments: ' + err.message);
      setModalType("error");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (oaData.length === 0) {
    return (
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
        <NavBar title="Assign Tutors" showBackButton={true} onBackClick={() => navigate('/admin')} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
        <Modal isOpen={modalOpen} title={modalTitle} message={modalMessage} type={modalType} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
      <NavBar title="Assign Tutors/Users to Time Slots" showBackButton={true} onBackClick={() => navigate('/admin')} />

      <section className="w-full py-8 px-6">
        <div className="max-w-[1800px] mx-auto flex gap-6">
          {/* Sidebar */}
          <div className={`transition-all duration-300 ${sidebarExpanded ? 'w-80' : 'w-16'} flex-shrink-0`}>
            <div className={`sticky top-4 rounded-lg shadow-lg overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Sidebar Header */}
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  {sidebarExpanded && (
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Analytics
                    </h3>
                  )}
                  <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className={`p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                    title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {sidebarExpanded ? '◀' : '▶'}
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              {sidebarExpanded && (
                <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Calendar Archive Button */}
                  <button
                    onClick={() => setShowArchive(true)}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'
                    }`}
                  >
                    📅 Calendar Archive
                  </button>

                  {/* Hour Warnings */}
                  {Object.keys(hourWarnings).length > 0 && (
                    <div className={`p-3 rounded-lg border-2 ${
                      isDarkMode
                        ? 'bg-orange-900/20 border-orange-700'
                        : 'bg-orange-50 border-orange-300'
                    }`}>
                      <h4 className={`font-semibold text-sm mb-2 ${
                        isDarkMode ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        ⚠️ Over 19 Hours:
                      </h4>
                      {Object.entries(hourWarnings).map(([name, hours]) => (
                        <div key={name} className={`text-xs mb-1 ${
                          isDarkMode ? 'text-orange-200' : 'text-orange-600'
                        }`}>
                          {name}: {hours}h
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tutor Hours List */}
                  <div>
                    <h4 className={`font-semibold text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tutor Hours:
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(calculateTutorHours())
                        .sort((a, b) => b[1] - a[1])
                        .map(([tutorName, hours]) => {
                          const tutorColor = getTutorColor(tutorName);
                          const isWarning = hours > 19;
                          return (
                            <div
                              key={tutorName}
                              className={`p-2 rounded text-sm ${
                                isWarning ? 'ring-2 ring-orange-500' : ''
                              }`}
                              style={{
                                backgroundColor: isDarkMode ? tutorColor.dark : tutorColor.light,
                                opacity: 0.9
                              }}
                            >
                              <div className="flex justify-between items-center text-white">
                                <span className="font-medium text-xs truncate flex-1">{tutorName}</span>
                                <span className="font-bold ml-2">{hours}h</span>
                              </div>
                            </div>
                          );
                        })}
                      {Object.keys(calculateTutorHours()).length === 0 && (
                        <p className={`text-xs italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          No assignments yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-slideInDown">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Assign Tutors/Users to Schedule
              </h1>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Click on a cell to assign an available Tutor/User
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/manage-tutors')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow'
                }`}
              >
                See Users
              </button>
              <button
                disabled
                className={`px-6 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                ⚙️ Adjust Calendar (Disabled)
              </button>
              <button
                onClick={handleClearAll}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 shadow'
                }`}
              >
                Clear All
              </button>
              <button
                onClick={handleSaveAssignments}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
                }`}
              >
                {loading ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-4 mb-6 animate-slideInUp animate-stagger-1">
            {Object.keys(sections).map(sectionKey => (
              <button
                key={sectionKey}
                onClick={() => setActiveSection(sectionKey)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeSection === sectionKey
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {sections[sectionKey]}
              </button>
            ))}
          </div>

          {/* Week Display Header */}
          <div className={`mb-4 p-4 rounded-lg text-center animate-fadeIn animate-stagger-2 ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gradient-to-r from-blue-50 to-cyan-50 text-gray-700'
          }`}>
            <span className="font-semibold text-lg">
              Week of {formatDate(weekDates[0])} - {formatDate(weekDates[4])}, {currentYear}
            </span>
          </div>

          {/* Assignment Grid */}
          <div className="overflow-x-auto rounded-lg shadow-lg animate-fadeIn animate-stagger-3">
            <div className="min-w-full">
              {/* Column Headers */}
              <div className="grid gap-0" style={{ gridTemplateColumns: '150px repeat(5, minmax(140px, 1fr))' }}>
                <div className={`p-3 font-bold text-center text-sm border ${
                  isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-200 text-gray-700 border-gray-300'
                }`}>
                  Time
                </div>
                {days.map((day, idx) => (
                  <div
                    key={day}
                    className={`p-3 font-bold text-center text-sm text-white border-t border-b border-r ${
                      isDarkMode ? 'bg-gray-700 border-gray-700' : 'bg-blue-600 border-gray-300'
                    }`}
                  >
                    {day}
                    <div className="text-xs mt-1 opacity-90">{formatDate(weekDates[idx])}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time) => (
                <div key={time} className="grid gap-0" style={{ gridTemplateColumns: '150px repeat(5, minmax(140px, 1fr))' }}>
                  <div
                    className={`p-3 text-center text-xs font-medium border-l border-r border-b h-[70px] flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}
                  >
                    {time}
                  </div>
                  {days.map(day => {
                    const assignedOAs = assignments[activeSection]?.[time]?.[day] || [];
                    const availableOAs = getAvailableOAs(time, day);
                    const dropdownKey = `${time}-${day}`;
                    const isDropdownOpen = openDropdown === dropdownKey;

                    return (
                      <div key={`${time}-${day}`} className={`border-r border-b relative h-[70px] ${
                        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100'
                      }`}>
                        {/* Current Assignment Box - Multi-person display */}
                        <div
                          className={`h-full flex items-center justify-center text-center font-medium text-sm cursor-pointer transition px-1 ${
                            assignedOAs.length > 0 ? 'flex-col gap-0.5 py-1' : ''
                          }`}
                          onClick={() => setAssignmentPopup({ timeSlot: time, day })}
                          style={{
                            backgroundColor: assignedOAs.length === 0
                              ? (isDarkMode ? '#2d3748' : '#f7fafc')
                              : 'transparent'
                          }}
                        >
                          {assignedOAs.length > 0 ? (
                            // Show multiple tutors with their colors
                            assignedOAs.map((tutor, idx) => {
                              const tutorColor = getTutorColor(tutor);
                              return (
                                <div
                                  key={idx}
                                  className="w-full px-1 py-0.5 rounded text-white text-xs truncate"
                                  style={{
                                    backgroundColor: isDarkMode ? tutorColor.dark : tutorColor.light
                                  }}
                                  title={tutor}
                                >
                                  {tutor}
                                </div>
                              );
                            })
                          ) : availableOAs.length > 0 ? (
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Click to assign ▼
                            </div>
                          ) : (
                            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No tutors</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Calendar Archive Modal */}
      {showArchive && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowArchive(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  📅 Calendar Archive
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View past week schedules and analytics
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...archivedWeeks].reverse().map((archive) => (
                    <button
                      key={archive.id}
                      className={`p-6 rounded-lg border transition-all duration-300 transform hover:scale-105 text-left ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-white border-gray-300 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">📅</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {Object.keys(archive.tutorHours).length} tutors
                        </span>
                      </div>
                      <h4 className={`font-bold text-lg mb-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Week of: {archive.startDate} - {archive.endDate}, {archive.year}
                      </h4>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Total Hours: {Object.values(archive.tutorHours).reduce((sum, h) => sum + h, 0)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowArchive(false)}
                  className={`w-full py-2 rounded-lg font-medium transition ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Multi-Person Assignment Popup */}
      {assignmentPopup && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setAssignmentPopup(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Assign Tutors
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {assignmentPopup.timeSlot} on {assignmentPopup.day} ({sections[activeSection]})
              </p>

              {/* Currently Assigned */}
              <div className="mb-4">
                <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Currently Assigned ({(assignments[activeSection]?.[assignmentPopup.timeSlot]?.[assignmentPopup.day] || []).length}/4):
                </h4>
                <div className="space-y-1">
                  {(assignments[activeSection]?.[assignmentPopup.timeSlot]?.[assignmentPopup.day] || []).length === 0 ? (
                    <p className={`text-sm italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      No one assigned yet
                    </p>
                  ) : (
                    (assignments[activeSection]?.[assignmentPopup.timeSlot]?.[assignmentPopup.day] || []).map((tutor, idx) => {
                      const tutorColor = getTutorColor(tutor);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 rounded"
                          style={{
                            backgroundColor: isDarkMode ? tutorColor.dark : tutorColor.light
                          }}
                        >
                          <span className="text-white font-medium">{tutor}</span>
                          <button
                            onClick={() => removeSpecificTutor(assignmentPopup.timeSlot, assignmentPopup.day, tutor)}
                            className="text-white hover:text-red-200 font-bold text-lg"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Available Tutors */}
              {(assignments[activeSection]?.[assignmentPopup.timeSlot]?.[assignmentPopup.day] || []).length < 4 && (
                <div className="mb-4">
                  <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Available Tutors:
                  </h4>
                  <div className={`max-h-48 overflow-y-auto rounded border ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}>
                    {getAvailableOAs(assignmentPopup.timeSlot, assignmentPopup.day).length === 0 ? (
                      <p className={`text-sm italic p-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        No available tutors for this slot
                      </p>
                    ) : (
                      getAvailableOAs(assignmentPopup.timeSlot, assignmentPopup.day).map(oa => {
                        const tutorColor = getTutorColor(oa.tutorName);
                        return (
                          <div
                            key={oa.tutorName}
                            onClick={() => assignOA(assignmentPopup.timeSlot, assignmentPopup.day, oa.tutorName)}
                            className="px-3 py-2 cursor-pointer text-white font-medium hover:opacity-90 transition border-b last:border-b-0"
                            style={{
                              backgroundColor: isDarkMode ? tutorColor.dark : tutorColor.light,
                              borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                            }}
                          >
                            {oa.tutorName}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                {(assignments[activeSection]?.[assignmentPopup.timeSlot]?.[assignmentPopup.day] || []).length > 0 && (
                  <button
                    onClick={() => {
                      clearAssignment(assignmentPopup.timeSlot, assignmentPopup.day);
                    }}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setAssignmentPopup(null)}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} title={modalTitle} message={modalMessage} type={modalType} onClose={() => setModalOpen(false)} />
    </div>
  );
}
