import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import { getUserColor } from './colorPalette';
import { API_URL } from './config';

export default function MasterSchedule() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('mathCenter');

  const timeSlots = [
    '10:00 – 10:30 AM', '10:30 – 11:00 AM', '11:00 – 11:30 AM', '11:30 – 12:00 PM', '12:00 – 12:30 PM',
    '12:30 – 1:00 PM', '1:00 – 1:30 PM', '1:30 – 2:00 PM', '2:00 – 2:30 PM', '2:30 – 3:00 PM',
    '3:00 – 3:30 PM', '3:30 – 4:00 PM', '4:00 – 4:30 PM', '4:30 – 5:00 PM', '5:00 – 5:30 PM',
    '5:30 – 6:00 PM', '6:00 – 6:30 PM', '6:30 – 7:00 PM', '7:00 – 7:30 PM'
  ];
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
  }, []);

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
    setTimeout(() => setRefreshing(false), 500);
  };

  // Build a matrix of time slots x days with assigned OAs for a specific section
  const getOAsForTimeSlot = (day, timeSlot, section) => {
    const matching = schedules.filter(
      s => s.dayOfWeek === day && s.timeSlot === timeSlot && s.section === section && s.tutorName
    );
    return matching.map(s => s.tutorName);
  };

  if (loading) {
    return (
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
        <NavBar title="Master Schedule" showBackButton={true} onBackClick={() => navigate('/admin')} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
      <NavBar title="Master Schedule" showBackButton={true} onBackClick={() => navigate('/admin')} />

      <section className="w-full py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-3xl font-bold animate-slideInDown ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Weekly Master Schedule
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
                    const tutors = getOAsForTimeSlot(day, time, activeSection);
                    const hasTutors = tutors.length > 0;

                    return (
                      <div
                        key={`${time}-${day}`}
                        className={`border-r border-b h-[70px] flex items-center justify-center text-center font-medium text-sm transition ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-300'
                        } ${
                          hasTutors
                            ? ''
                            : isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {hasTutors ? (
                          <div className="w-full px-1 py-1 flex flex-col gap-0.5">
                            {tutors.map((tutor, idx) => {
                              const userColor = getUserColor(tutor);
                              return (
                                <div
                                  key={idx}
                                  className="w-full px-1 py-0.5 rounded text-white text-xs truncate"
                                  style={{
                                    backgroundColor: isDarkMode ? userColor.dark : userColor.light
                                  }}
                                  title={tutor}
                                >
                                  {tutor}
                                </div>
                              );
                            })}
                          </div>
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
        </div>
      </section>
    </div>
  );
}
