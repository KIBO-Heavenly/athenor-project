import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';

export default function TutorSchedule() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [updateInput, setUpdateInput] = useState('');

  // Dummy schedule data with 7 tutors and all days of the week
  const scheduleData = [
    {
      id: 1,
      fullName: 'John Smith',
      monday: '9:00 AM - 12:00 PM',
      tuesday: '2:00 PM - 5:00 PM',
      wednesday: '10:00 AM - 1:00 PM',
      thursday: '3:00 PM - 6:00 PM',
      friday: '9:00 AM - 12:00 PM',
      saturday: '1:00 PM - 4:00 PM',
      sunday: 'Off'
    },
    {
      id: 2,
      fullName: 'Sarah Johnson',
      monday: '1:00 PM - 4:00 PM',
      tuesday: '9:00 AM - 12:00 PM',
      wednesday: '2:00 PM - 5:00 PM',
      thursday: '10:00 AM - 1:00 PM',
      friday: '1:00 PM - 4:00 PM',
      saturday: 'Off',
      sunday: '2:00 PM - 5:00 PM'
    },
    {
      id: 3,
      fullName: 'Michael Chen',
      monday: '10:00 AM - 1:00 PM',
      tuesday: '3:00 PM - 6:00 PM',
      wednesday: '9:00 AM - 12:00 PM',
      thursday: '1:00 PM - 4:00 PM',
      friday: '10:00 AM - 1:00 PM',
      saturday: '2:00 PM - 5:00 PM',
      sunday: '3:00 PM - 6:00 PM'
    },
    {
      id: 4,
      fullName: 'Emily Davis',
      monday: '2:00 PM - 5:00 PM',
      tuesday: '10:00 AM - 1:00 PM',
      wednesday: '1:00 PM - 4:00 PM',
      thursday: '9:00 AM - 12:00 PM',
      friday: '2:00 PM - 5:00 PM',
      saturday: 'Off',
      sunday: '1:00 PM - 4:00 PM'
    },
    {
      id: 5,
      fullName: 'Robert Martinez',
      monday: '9:00 AM - 12:00 PM',
      tuesday: '1:00 PM - 4:00 PM',
      wednesday: '3:00 PM - 6:00 PM',
      thursday: '2:00 PM - 5:00 PM',
      friday: 'Off',
      saturday: '9:00 AM - 12:00 PM',
      sunday: '2:00 PM - 5:00 PM'
    },
    {
      id: 6,
      fullName: 'Jessica Lee',
      monday: '3:00 PM - 6:00 PM',
      tuesday: '9:00 AM - 12:00 PM',
      wednesday: '10:00 AM - 1:00 PM',
      thursday: '2:00 PM - 5:00 PM',
      friday: '9:00 AM - 12:00 PM',
      saturday: '1:00 PM - 4:00 PM',
      sunday: 'Off'
    },
    {
      id: 7,
      fullName: 'David Wilson',
      monday: '1:00 PM - 4:00 PM',
      tuesday: '2:00 PM - 5:00 PM',
      wednesday: '9:00 AM - 12:00 PM',
      thursday: '10:00 AM - 1:00 PM',
      friday: '1:00 PM - 4:00 PM',
      saturday: '3:00 PM - 6:00 PM',
      sunday: '10:00 AM - 1:00 PM'
    }
  ];

  const handleUpdateSchedule = () => {
    if (updateInput.trim()) {
      alert(`Schedule update: ${updateInput}`);
      setUpdateInput('');
    }
  };

  return (
    <div className={isDarkMode ? 'min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' : 'min-h-screen bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50'}>
      {/* NAVBAR */}
      <nav className={isDarkMode ? 'w-full border-b bg-gray-800/90 backdrop-blur-xl border-gray-700' : 'w-full border-b bg-gradient-to-r from-blue-500/90 via-cyan-500/90 to-emerald-500/90 backdrop-blur-xl'}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-white">
            Athenor
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/tutor-dashboard')}
              className="text-gray-100 hover:text-white transition font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <section className="w-full py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className={isDarkMode ? 'text-3xl font-bold text-white mb-2' : 'text-3xl font-bold text-gray-900 mb-2'}>Tutor Schedule</h1>
          <p className={isDarkMode ? 'text-gray-400 mb-6' : 'text-gray-600 mb-6'}>Manage and view all tutor schedules for the week</p>

          {/* SCHEDULE TABLE */}
          <div className={`overflow-x-auto rounded-lg shadow border mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-cyan-200'}`}>
            <table className="w-full border-collapse">
              <thead>
                <tr className={isDarkMode ? 'bg-gradient-to-r from-emerald-700 to-cyan-700 text-white' : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white'}>
                  <th className="px-6 py-3 text-left font-semibold">Tutor Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Monday</th>
                  <th className="px-6 py-3 text-left font-semibold">Tuesday</th>
                  <th className="px-6 py-3 text-left font-semibold">Wednesday</th>
                  <th className="px-6 py-3 text-left font-semibold">Thursday</th>
                  <th className="px-6 py-3 text-left font-semibold">Friday</th>
                  <th className="px-6 py-3 text-left font-semibold">Saturday</th>
                  <th className="px-6 py-3 text-left font-semibold">Sunday</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((tutor, index) => (
                  <tr
                    key={tutor.id}
                    className={`border-b transition hover:bg-opacity-50 ${
                      isDarkMode
                        ? `border-gray-700 hover:bg-gray-700/50 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`
                        : `border-cyan-200 hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`
                    }`}
                  >
                    <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tutor.fullName}</td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tutor.monday}</td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tutor.tuesday}</td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tutor.wednesday}</td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tutor.thursday}</td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tutor.friday}</td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tutor.saturday}</td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tutor.sunday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* UPDATE SCHEDULE SECTION */}
          <div className={`rounded-lg shadow border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-cyan-200'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Update Schedule</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Schedule Update Notes
                </label>
                <input
                  type="text"
                  value={updateInput}
                  onChange={(e) => setUpdateInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateSchedule()}
                  placeholder="Enter schedule update information..."
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                      : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
                  }`}
                />
              </div>
              <button
                onClick={handleUpdateSchedule}
                className={`px-6 py-2 rounded-lg transition font-medium text-white ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg'
                }`}
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
