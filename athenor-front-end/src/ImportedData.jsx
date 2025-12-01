import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';

export default function ImportedData() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [isMultiSortActive, setIsMultiSortActive] = useState(false);
  const [multiSortDirection, setMultiSortDirection] = useState('asc');

  const data = location.state?.data || [];
  const headers = location.state?.headers || [];

  if (data.length === 0) {
    return (
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
        <nav className={isDarkMode ? 'w-full border-b bg-gray-800/90 backdrop-blur-xl border-gray-700' : 'w-full border-b bg-gradient-to-r from-blue-600/90 via-cyan-500/90 to-emerald-500/90 backdrop-blur-xl'}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight text-white">
              Athenor Admin
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-gray-200 hover:text-white transition"
            >
              Back to Dashboard
            </button>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No data to display. Please upload a file first.</p>
          <button
            onClick={() => navigate('/admin')}
            className={`mt-4 px-6 py-2 rounded-lg ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:shadow-lg'} text-white`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get numeric columns for sorting
  const numericColumns = headers.filter(header => {
    return data.some(row => !isNaN(parseFloat(row[header])) && row[header] !== '');
  });

  // Get sortable text columns (for A-Z sorting)
  const textColumns = headers.filter(header => {
    return data.some(row => typeof row[header] === 'string' || row[header] instanceof String);
  });

  const handleSort = (key, direction = null) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        setSortConfig({ key, direction: 'desc' });
      } else {
        setSortConfig({ key: null, direction: 'asc' });
      }
    } else {
      setSortConfig({ key, direction: direction || 'asc' });
    }
  };

  // Handle multi-level sort (Grade first, then GPA)
  const handleMultiSort = () => {
    setIsMultiSortActive(!isMultiSortActive);
    if (!isMultiSortActive) {
      setMultiSortDirection('asc');
    }
  };

  // Toggle multi-sort direction
  const toggleMultiSortDirection = () => {
    setMultiSortDirection(multiSortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Apply sorting and filtering
  let sortedData = [...data];

  // Apply filters
  if (Object.keys(filters).length > 0) {
    sortedData = sortedData.filter(row => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = String(row[key] || '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      });
    });
  }

  // Apply sorting
  if (isMultiSortActive) {
    // Multi-level sort: Grade first, then GPA
    sortedData.sort((a, b) => {
      // Find Grade and GPA columns (case-insensitive)
      const gradeKey = headers.find(h => h.toLowerCase().includes('grade'));
      const gpaKey = headers.find(h => h.toLowerCase().includes('gpa'));

      if (!gradeKey) return 0; // If no grade column, don't sort

      // First, sort by Grade
      const gradeA = String(a[gradeKey] || '');
      const gradeB = String(b[gradeKey] || '');

      const gradeCompare = multiSortDirection === 'asc'
        ? gradeA.localeCompare(gradeB)
        : gradeB.localeCompare(gradeA);

      // If grades are the same, sort by GPA
      if (gradeCompare === 0 && gpaKey) {
        const gpaA = parseFloat(a[gpaKey]) || 0;
        const gpaB = parseFloat(b[gpaKey]) || 0;
        return multiSortDirection === 'asc' ? gpaB - gpaA : gpaA - gpaB; // Higher GPA wins
      }

      return gradeCompare;
    });
  } else if (sortConfig.key) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle numeric sorting
      if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
        const numA = parseFloat(aValue);
        const numB = parseFloat(bValue);
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // Handle text sorting
      const strA = String(aValue || '').toLowerCase();
      const strB = String(bValue || '').toLowerCase();
      if (sortConfig.direction === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
      {/* NAVBAR */}
      <nav className={isDarkMode ? 'w-full border-b bg-gray-800/90 backdrop-blur-xl border-gray-700' : 'w-full border-b bg-gradient-to-r from-blue-600/90 via-cyan-500/90 to-emerald-500/90 backdrop-blur-xl'}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-white">
            Athenor Admin
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-gray-200 hover:text-white transition font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <section className="w-full py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className={isDarkMode ? 'text-3xl font-bold text-white mb-2' : 'text-3xl font-bold text-gray-900 mb-2'}>Imported Data</h1>
          <p className={isDarkMode ? 'text-gray-400 mb-6' : 'text-gray-600 mb-6'}>Total Records: {sortedData.length}</p>

          {/* SORTING BUTTONS */}
          <div className="mb-6 flex gap-2 items-center">
            <button
              onClick={handleMultiSort}
              className={`px-4 py-2 rounded font-medium transition ${
                isMultiSortActive
                  ? isDarkMode ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
                  : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Sort All (Grade + GPA)
            </button>
            {isMultiSortActive && (
              <button
                onClick={toggleMultiSortDirection}
                className={`px-3 py-2 rounded font-medium hover:opacity-90 transition text-white ${
                  isDarkMode
                    ? 'bg-emerald-700'
                    : 'bg-purple-500'
                }`}
              >
                {multiSortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            )}
          </div>

          {/* FILTERS */}
          <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-cyan-200'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {headers.slice(0, 6).map(header => (
                <div key={`filter-${header}`}>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {header}
                  </label>
                  <input
                    type="text"
                    placeholder={`Filter by ${header}...`}
                    value={filters[header] || ''}
                    onChange={(e) => handleFilterChange(header, e.target.value)}
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 transition-all ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-emerald-500'
                        : 'bg-white border-cyan-200 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* DATA TABLE */}
          <div className={`overflow-x-auto rounded-lg shadow border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-cyan-200'}`}>
            <table className="w-full border-collapse">
              <thead>
                <tr className={isDarkMode ? 'bg-gradient-to-r from-emerald-700 to-cyan-700 border-b border-gray-700' : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 border-b border-cyan-200'}>
                  {headers.map(header => (
                    <th
                      key={header}
                      className={`px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:opacity-80 transition text-white`}
                      onClick={() => {
                        setIsMultiSortActive(false);
                        handleSort(header);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {header}
                        {sortConfig.key === header && (
                          <span className="text-xs font-bold">
                            {sortConfig.direction === 'asc' ? '[Asc]' : '[Desc]'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b transition ${
                      isDarkMode
                        ? `border-gray-700 hover:bg-gray-700/50 ${rowIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`
                        : `border-cyan-200 hover:bg-blue-50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`
                    }`}
                  >
                    {headers.map(header => (
                      <td
                        key={`${rowIndex}-${header}`}
                        className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedData.length === 0 && (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              No records match your filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
