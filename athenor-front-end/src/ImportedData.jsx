import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import { getDashboardPath } from './ProtectedRoute';

export default function ImportedData() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});

  const data = location.state?.data || [];
  const headers = location.state?.headers || [];
  const title = location.state?.title || 'Imported Data';

  if (data.length === 0) {
    return (
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
        <NavBar title="Imported Data" showBackButton={true} onBackClick={() => navigate(getDashboardPath())} />
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No data to display. Please upload a file first.</p>
          <button
            onClick={() => navigate(getDashboardPath())}
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

  // Helper function to check if a filter matches (generic, works for any column)
  const filterMatches = (cellValue, filterValue) => {
    if (!filterValue) return true;
    
    const cellStr = String(cellValue || '').toLowerCase().trim();
    const filterStr = filterValue.toLowerCase().trim();
    
    // Support comma-separated values (e.g., "A,B" or "A, B")
    if (filterStr.includes(',')) {
      const filterOptions = filterStr.split(',').map(opt => opt.trim());
      return filterOptions.some(opt => cellStr.includes(opt));
    }
    
    // Use substring matching for single values
    return cellStr.includes(filterStr);
  };

  // Apply sorting and filtering
  let sortedData = [...data];

  // Apply filters
  if (Object.keys(filters).length > 0) {
    sortedData = sortedData.filter(row => {
      return Object.entries(filters).every(([key, filterValue]) => {
        return filterMatches(row[key], filterValue);
      });
    });
    
    // Priority sort for grade filters (A,B shows A's first, then B's)
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue && filterValue.includes(',')) {
        const filterOptions = filterValue.toLowerCase().split(',').map(opt => opt.trim());
        sortedData.sort((a, b) => {
          const aValue = String(a[key] || '').toLowerCase().trim();
          const bValue = String(b[key] || '').toLowerCase().trim();
          
          // Find which filter option matches (exact or contains)
          const aIndex = filterOptions.findIndex(opt => aValue === opt || aValue.includes(opt));
          const bIndex = filterOptions.findIndex(opt => bValue === opt || bValue.includes(opt));
          
          // If both match, sort by their position in the filter list
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          
          // Items that match come before items that don't
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });
      }
    });
  }

  // Apply sorting (after filter priority sort)
  if (sortConfig.key) {
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

  const exportToCSV = () => {
    // Create CSV content
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    sortedData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
      {/* NAVBAR */}
      <NavBar title="Imported Data" showBackButton={true} onBackClick={() => navigate(getDashboardPath())} />

      {/* MAIN CONTENT */}
      <section className="w-full py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`${isDarkMode ? 'text-3xl font-bold text-white mb-2' : 'text-3xl font-bold text-gray-900 mb-2'} animate-slideInDown`}>{title}</h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} animate-slideInLeft animate-stagger-1`}>Total Records: {sortedData.length}</p>
            </div>
            <button
              onClick={exportToCSV}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
              }`}
            >
              📥 Export to CSV
            </button>
          </div>

          {/* SORTING INFO */}
          <div className="mb-6 animate-fadeIn animate-stagger-2">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 Click on any column header to sort by that column
            </p>
          </div>

          {/* FILTERS */}
          <div className={`mb-6 p-4 rounded-lg border animate-slideInUp animate-stagger-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-cyan-200'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {headers.map(header => (
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
          <div className={`overflow-x-auto rounded-lg shadow border animate-slideInUp animate-stagger-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-cyan-200'}`}>
            <table className="w-full border-collapse">
              <thead>
                <tr className={isDarkMode ? 'bg-gradient-to-r from-emerald-700 to-cyan-700 border-b border-gray-700' : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 border-b border-cyan-200'}>
                  {headers.map(header => (
                    <th
                      key={header}
                      className={`px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:opacity-80 transition text-white`}
                      onClick={() => handleSort(header)}
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
