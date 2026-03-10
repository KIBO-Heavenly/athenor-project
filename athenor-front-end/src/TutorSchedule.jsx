import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import { getUserColor } from './colorPalette';
import { API_URL } from './config';
import api from './api';

export default function TutorSchedule() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('mathCenter');
  const [tutorColors, setTutorColors] = useState({}); // Custom tutor colors from database

  // Default time slots - will be updated from backend
  const [timeSlots, setTimeSlots] = useState([
    '10:00 – 10:30 AM', '10:30 – 11:00 AM', '11:00 – 11:30 AM', '11:30 – 12:00 PM', '12:00 – 12:30 PM',
    '12:30 – 1:00 PM', '1:00 – 1:30 PM', '1:30 – 2:00 PM', '2:00 – 2:30 PM', '2:30 – 3:00 PM',
    '3:00 – 3:30 PM', '3:30 – 4:00 PM', '4:00 – 4:30 PM', '4:30 – 5:00 PM', '5:00 – 5:30 PM',
    '5:30 – 6:00 PM', '6:00 – 6:30 PM', '6:30 – 7:00 PM'
  ]);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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
    fetchSchedules();
    loadTutorColors();
    loadCalendarConfig();
  }, []);

  // Load calendar configuration from backend database
  const loadCalendarConfig = async () => {
    try {
      const response = await api.get('/api/CalendarConfig');
      if (response.ok) {
        const config = await response.json();
        const slots = JSON.parse(config.timeSlotsJson);
        if (Array.isArray(slots) && slots.length > 0) {
          setTimeSlots(slots);
          console.log('Loaded calendar config from backend:', slots);
        }
      } else {
        console.log('No calendar config in database, using defaults');
      }
    } catch (err) {
      console.error('Error loading calendar config from backend:', err);
    }
  };

  // Load custom tutor colors from database
  const loadTutorColors = async () => {
    try {
      const response = await api.get('/api/TutorColors');
      if (response.ok) {
        const colors = await response.json();
        const colorsMap = {};
        colors.forEach(c => {
          colorsMap[c.tutorName] = { light: c.colorLight, dark: c.colorDark };
        });
        console.log('Loaded tutor colors from database:', colorsMap);
        setTutorColors(colorsMap);
      } else {
        console.log('No tutor colors in database yet');
      }
    } catch (err) {
      console.error('Error loading tutor colors:', err);
    }
  };

  // Get color for a tutor - use custom color if set, otherwise use default
  const getTutorColor = (tutorName) => {
    if (tutorColors[tutorName]) {
      return tutorColors[tutorName];
    }
    return getUserColor(tutorName);
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_URL}/api/Schedule`);
      if (!response.ok) throw new Error('Failed to fetch schedules');

      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
    await loadTutorColors(); // Also reload colors on refresh
    setTimeout(() => setRefreshing(false), 500);
  };

  // Build a matrix of time slots x days with assigned OAs for a specific section
  const getOAForTimeSlot = (day, timeSlot, section) => {
    const matching = schedules.filter(
      s => s.dayOfWeek === day && s.timeSlot === timeSlot && s.section === section && s.tutorName
    );
    return matching.length > 0 ? matching[0].tutorName : null;
  };

  if (loading) {
    return (
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
        <NavBar title="Weekly Schedule" showBackButton={true} onBackClick={() => navigate('/tutor-dashboard')} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className={`text-xl animate-pulse-subtle ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
      <NavBar title="Weekly Schedule" showBackButton={true} onBackClick={() => navigate('/tutor-dashboard')} />

      <section className="w-full py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-3xl font-bold animate-slideInDown ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Weekly Schedule
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Week of {formatDate(weekDates[0])} - {formatDate(weekDates[4])}, {currentYear}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
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
                'Refresh Schedule'
              )}
            </button>
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

          <div className="overflow-x-auto rounded-lg shadow-lg animate-fadeIn animate-stagger-2">
            <div className="inline-block min-w-full">
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
                    className={`p-3 text-center text-sm border-t border-b border-r ${
                      isDarkMode
                        ? 'bg-gray-700 text-white border-gray-700'
                        : 'bg-blue-600 text-white border-gray-300'
                    }`}
                  >
                    <div className="font-bold">{day}</div>
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
                    const oa = getOAForTimeSlot(day, time, activeSection);
                    const userColor = oa ? getTutorColor(oa) : null;

                    return (
                      <div
                        key={`${time}-${day}`}
                        className={`border-r border-b h-[70px] flex items-center justify-center text-center font-medium text-sm transition ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-300'
                        } ${
                          oa
                            ? 'text-white'
                            : isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-50 text-gray-400'
                        }`}
                        style={{
                          backgroundColor: oa
                            ? (isDarkMode ? userColor.dark : userColor.light)
                            : 'transparent'
                        }}
                      >
                        {oa ? (
                          <div className="truncate px-2 w-full">{oa}</div>
                        ) : (
                          <div className="text-gray-400">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {sections[activeSection]} - Schedule Summary
            </h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Total OAs Assigned: <span className="font-bold">
                {new Set(schedules.filter(s => s.section === activeSection).map(s => s.tutorName)).size}
              </span>
            </p>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Total Time Slots Covered: <span className="font-bold">
                {schedules.filter(s => s.section === activeSection).length}
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
