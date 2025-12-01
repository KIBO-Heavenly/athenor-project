import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImportData = () => {
    const fileInput = document.getElementById('fileUpload');
    fileInput.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5137/api/dataimport/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload file');
        setUploading(false);
        return;
      }

      const result = await response.json();
      console.log('File uploaded successfully:', result);

      // Navigate to the ImportedData page with the data
      navigate('/imported-data', {
        state: {
          headers: result.headers,
          data: result.data,
          totalRows: result.totalRows
        }
      });
    } catch (err) {
      setError('Error uploading file: ' + err.message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <div className={`min-h-screen ${
      isDarkMode
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50'
    }`}>

      {/* NAVBAR */}
      <nav className={`w-full border-b backdrop-blur-xl ${
        isDarkMode
          ? 'bg-gray-800/90 border-gray-700'
          : 'bg-gradient-to-r from-blue-600/90 via-cyan-500/90 to-emerald-500/90'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-white">
            Athenor Admin
          </div>

          <div className="flex items-center gap-8 text-gray-100 font-medium">
            <button
              onClick={() => navigate('/settings')}
              className="hover:text-white transition">Settings</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className={`w-full ${
        isDarkMode
          ? 'bg-gradient-to-b from-gray-800/50 to-gray-900/50'
          : 'bg-gradient-to-b from-blue-100 via-cyan-50 to-emerald-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <h1 className={`text-5xl font-bold leading-tight tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Admin Dashboard
          </h1>

          <p className={`text-lg mt-6 max-w-2xl mx-auto leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Manage tutors, students, and analytics from a single powerful interface.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <input
              id="fileUpload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button 
              onClick={handleImportData}
              disabled={uploading}
              className={`px-8 py-3 rounded-xl shadow transition font-medium ${
                uploading
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              } ${
                isDarkMode
                  ? uploading ? 'bg-gray-700 text-gray-400' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  : uploading ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
              }`}>
              {uploading ? 'Uploading...' : 'Import Data'}
            </button>

            <button className={`px-8 py-3 rounded-xl transition font-medium ${
              isDarkMode
                ? 'border border-gray-600 text-gray-300 hover:bg-gray-700/50'
                : 'border border-cyan-400 text-gray-700 hover:bg-white/50'
            }`}>
              Upload Schedule
            </button>
          </div>

          {error && (
            <div className={`mt-4 p-4 rounded-lg max-w-md mx-auto ${
              isDarkMode
                ? 'bg-red-900/30 border border-red-700/50 text-red-300'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {error}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
