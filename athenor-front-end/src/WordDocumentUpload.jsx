import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import Modal from './Modal';
import mammoth from 'mammoth';
import { getUserColor } from './colorPalette';
import { API_URL } from './config';

export default function WordDocumentUpload() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [extractedData, setExtractedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'review'
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const timeSlots = [
    '10:00 – 10:30 AM', '10:30 – 11:00 AM', '11:00 – 11:30 AM', '11:30 – 12:00 PM', '12:00 – 12:30 PM',
    '12:30 – 1:00 PM', '1:00 – 1:30 PM', '1:30 – 2:00 PM', '2:00 – 2:30 PM', '2:30 – 3:00 PM',
    '3:00 – 3:30 PM', '3:30 – 4:00 PM', '4:00 – 4:30 PM', '4:30 – 5:00 PM', '5:00 – 5:30 PM',
    '5:30 – 6:00 PM', '6:00 – 6:30 PM', '6:30 – 7:00 PM'
  ];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    const allParsedData = [];
    
    try {
      for (const file of files) {
        // Read the file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Extract document content using Mammoth with HTML output (preserves table structure)
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const htmlContent = result.value;

        // LOG THE HTML FOR DEBUGGING
        console.log(`=== HTML FROM FILE ${file.name} ===`);
        console.log(htmlContent);
        console.log('=== END HTML ===');

        // Parse the document to extract name and availability
        const parsedData = parseWordDocument(htmlContent);

        if (parsedData.length > 0) {
          allParsedData.push(...parsedData);
        }
      }

      if (allParsedData.length === 0) {
        setModalTitle("No Data Found");
        setModalMessage("Could not extract any availability information from the uploaded file(s). Please ensure the documents have a table with names and availability marked with 'x'.");
        setModalType("warning");
        setModalOpen(true);
      } else {
        setExtractedData([...extractedData, ...allParsedData]);
        setUploadMode('review');
        setModalTitle("Success");
        setModalMessage(`Extracted ${allParsedData.length} user(s) from ${files.length} file(s). Review and edit as needed.`);
        setModalType("success");
        setModalOpen(true);
      }
    } catch (err) {
      console.error('Error processing files:', err);
      setModalTitle("Error");
      setModalMessage("Failed to process the Word document(s). Please ensure they are valid .docx files.");
      setModalType("error");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const parseWordDocument = (htmlContent) => {
    // Extract name from "Name: __NAME___" pattern in the HTML
    const nameMatch = htmlContent.match(/Name:\s*_+\s*([^_<\n]+?)\s*_+/i);
    if (!nameMatch || !nameMatch[1]) {
      console.warn('Could not extract name from document');
      return [];
    }

    const tutorName = nameMatch[1].trim();
    console.log('Extracted tutor name:', tutorName);

    // Parse HTML to find the table
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/i;
    const tableMatch = htmlContent.match(tableRegex);
    
    if (!tableMatch) {
      console.warn('Could not find table in HTML');
      return [];
    }

    const tableHtml = tableMatch[1];
    console.log('Found table HTML');

    // Extract all rows from the table
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = [];
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      rows.push(rowMatch[1]);
    }

    console.log(`Found ${rows.length} rows in table`);

    // First row is usually headers (MONDAY, TUESDAY, etc.)
    const headerRow = rows[0];
    const headerCells = headerRow.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
    
    const dayHeaders = headerCells.map(cell => {
      const text = cell.replace(/<[^>]*>/g, '').trim().toUpperCase();
      return text;
    });

    console.log('Day headers:', dayHeaders);

    // Define our standard time slots
    const timeSlots = [
      '10:00 – 10:30 AM', '10:30 – 11:00 AM', '11:00 – 11:30 AM', '11:30 – 12:00 PM', '12:00 – 12:30 PM',
      '12:30 – 1:00 PM', '1:00 – 1:30 PM', '1:30 – 2:00 PM', '2:00 – 2:30 PM', '2:30 – 3:00 PM',
      '3:00 – 3:30 PM', '3:30 – 4:00 PM', '4:00 – 4:30 PM', '4:30 – 5:00 PM', '5:00 – 5:30 PM',
      '5:30 – 6:00 PM', '6:00 – 6:30 PM', '6:30 – 7:00 PM', '7:00 – 7:30 PM'
    ];

    // Initialize all slots as false
    const timeSlotAvailability = {};
    timeSlots.forEach(slot => {
      timeSlotAvailability[slot] = {
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false
      };
    });

    // Create a mapping of time patterns to standard slots
    const timeMapping = {
      '10:00': '10:00 – 10:30 AM',
      '10:30': '10:30 – 11:00 AM',
      '11:00': '11:00 – 11:30 AM',
      '11:30': '11:30 – 12:00 PM',
      '12:00': '12:00 – 12:30 PM',
      '12:30': '12:30 – 1:00 PM',
      '1:00': '1:00 – 1:30 PM',
      '1:30': '1:30 – 2:00 PM',
      '2:00': '2:00 – 2:30 PM',
      '2:30': '2:30 – 3:00 PM',
      '3:00': '3:00 – 3:30 PM',
      '3:30': '3:30 – 4:00 PM',
      '4:00': '4:00 – 4:30 PM',
      '4:30': '4:30 – 5:00 PM',
      '5:00': '5:00 – 5:30 PM',
      '5:30': '5:30 – 6:00 PM',
      '6:00': '6:00 – 6:30 PM',
      '6:30': '6:30 – 7:00 PM',
      '7:00': '7:00 – 7:30 PM'
    };

    // Helper function to find matching time slot
    const findMatchingSlot = (timeCell) => {
      const cellText = timeCell.toLowerCase().trim();
      
      // Try to find time pattern in the cell
      for (const [pattern, slot] of Object.entries(timeMapping)) {
        if (cellText.includes(pattern)) {
          return slot;
        }
      }
      
      return null;
    };

    // Process data rows (skip first row which is headers)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
      
      if (cells.length === 0) continue;

      const cellValues = cells.map(cell => {
        const text = cell.replace(/<[^>]*>/g, '').trim();
        return text;
      });

      // Extract time from first cell
      const timeCell = cellValues[0];
      console.log(`Row ${i}: Time cell = "${timeCell}", All cells:`, cellValues);
      
      const matchedSlot = findMatchingSlot(timeCell);

      if (!matchedSlot) {
        console.warn(`Could not match time "${timeCell}"`);
        continue;
      }

      console.log(`  Matched to slot: ${matchedSlot}`);

      // Check each day column for this time slot
      for (let j = 1; j < cellValues.length && j < dayHeaders.length; j++) {
        const cellValue = cellValues[j];
        const dayHeader = dayHeaders[j];

        // Normalize day header
        let dayName = '';
        if (dayHeader.includes('MON')) dayName = 'Monday';
        else if (dayHeader.includes('TUE')) dayName = 'Tuesday';
        else if (dayHeader.includes('WED')) dayName = 'Wednesday';
        else if (dayHeader.includes('THU')) dayName = 'Thursday';
        else if (dayHeader.includes('FRI')) dayName = 'Friday';
        else if (dayHeader.includes('SAT')) dayName = 'Saturday';
        else if (dayHeader.includes('SUN')) dayName = 'Sunday';

        // Check if cell contains 'x' or 'X'
        if (dayName && /[xX]/.test(cellValue)) {
          if (timeSlotAvailability[matchedSlot] && timeSlotAvailability[matchedSlot][dayName] !== undefined) {
            timeSlotAvailability[matchedSlot][dayName] = true;
            console.log(`  ✓ ${dayName} = TRUE (cell value: "${cellValue}")`);
          }
        }
      }
    }

    console.log('=== FINAL AVAILABILITY ===');
    console.log(timeSlotAvailability);

    return [{
      tutorName: tutorName,
      availability: timeSlotAvailability
    }];
  };

  const handleUpdateName = (index, newName) => {
    const updated = [...extractedData];
    updated[index].tutorName = newName;
    setExtractedData(updated);
  };

  const handleUpdateDay = (index, day, isAvailable) => {
    const updated = [...extractedData];
    updated[index].availability[day] = isAvailable;
    setExtractedData(updated);
  };

  const handleDeleteTutor = (index) => {
    const updated = extractedData.filter((_, i) => i !== index);
    setExtractedData(updated);
  };

  const handleEditStart = (index) => {
    setEditingIndex(index);
    setEditingData({ ...extractedData[index] });
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingData(null);
  };

  const handleEditSave = () => {
    const updated = [...extractedData];
    updated[editingIndex] = editingData;
    setExtractedData(updated);
    setEditingIndex(null);
    setEditingData(null);
  };

  const handleNameChange = (newName) => {
    setEditingData({
      ...editingData,
      tutorName: newName
    });
  };

  const handleAvailabilityChange = (day, timeSlot, available) => {
    setEditingData({
      ...editingData,
      availability: {
        ...editingData.availability,
        [timeSlot]: {
          ...editingData.availability[timeSlot],
          [day]: available
        }
      }
    });
  };

  const handleSaveToDatabase = async () => {
    try {
      // First, fetch existing tutors from backend
      const backendResponse = await fetch(`${API_URL}/api/TutorAvailability`);
      let existingBackendData = [];
      if (backendResponse.ok) {
        existingBackendData = await backendResponse.json();
      }
      
      const existingNames = existingBackendData.map(oa => oa.tutorName.toLowerCase().trim());
      
      const duplicates = [];
      const newTutors = [];
      
      extractedData.forEach(tutor => {
        const name = tutor.tutorName.toLowerCase().trim();
        if (existingNames.includes(name)) {
          duplicates.push(tutor.tutorName);
        } else {
          newTutors.push(tutor);
          existingNames.push(name); // Add to existing names to catch duplicates within the current batch
        }
      });
      
      if (duplicates.length > 0) {
        setModalTitle("Duplicate Users Found");
        setModalMessage(`The following user(s) already exist: ${duplicates.join(', ')}. Please remove them or rename them before saving.`);
        setModalType("error");
        setModalOpen(true);
        return;
      }
      
      // Save to backend via batch endpoint
      const tutorsToSave = newTutors.map(tutor => ({
        tutorName: tutor.tutorName,
        availabilityJson: JSON.stringify(tutor.availability)
      }));

      const saveResponse = await fetch(`${API_URL}/api/TutorAvailability/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorsToSave)
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save to backend');
      }

      const result = await saveResponse.json();

      // Also save to localStorage for backwards compatibility (temporary)
      const existingLocalData = JSON.parse(localStorage.getItem('oaAvailability') || '[]');
      const allData = [...existingLocalData, ...newTutors];
      localStorage.setItem('oaAvailability', JSON.stringify(allData));

      setModalTitle("Success");
      setModalMessage(`Successfully saved ${result.created || newTutors.length} user(s) to the database! Everyone can now see them.`);
      setModalType("success");
      setModalOpen(true);
      
      // Store navigation flag for modal to trigger after OK
      sessionStorage.setItem('navigateAfterModal', '/admin');
    } catch (err) {
      setModalTitle("Error");
      setModalMessage('Error saving data: ' + err.message);
      setModalType("error");
      setModalOpen(true);
    }
  };

  if (uploadMode === 'upload') {
    return (
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
        <NavBar title="Upload Word Document" showBackButton={true} onBackClick={() => navigate('/admin')} />
        
        <section className="w-full py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className={`text-4xl font-bold mb-6 animate-slideInDown ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Upload Availability Form
            </h1>
            
            <p className={`text-lg mb-10 animate-slideInUp animate-stagger-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Drag and drop files here, or click to browse
            </p>

            <div
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.docx'));
                if (files.length > 0) {
                  handleFilesUpload(files);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`border-4 border-dashed rounded-xl p-12 transition-all duration-300 animate-scaleIn animate-stagger-2 ${
                isDragging
                  ? isDarkMode
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-blue-500 bg-blue-100'
                  : isDarkMode
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <label className={`inline-block px-8 py-4 rounded-xl cursor-pointer transition-all duration-300 font-medium transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-white hover:shadow-lg'
              }`}>
                {loading ? 'Processing...' : 'Choose File(s)'}
                <input
                  id="fileUpload"
                  type="file"
                  accept=".docx"
                  multiple
                  onChange={(e) => handleFilesUpload(Array.from(e.target.files))}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
              </label>
              
              <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Supports .docx files • Multiple files allowed
              </p>
            </div>
          </div>
        </section>

        <Modal isOpen={modalOpen} title={modalTitle} message={modalMessage} type={modalType} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
      <NavBar title="Review & Edit Availability" showBackButton={true} onBackClick={() => navigate('/admin')} />

      <section className="w-full py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8 animate-slideInDown">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Extracted Users ({extractedData.length})
            </h1>
            <button
              onClick={handleSaveToDatabase}
              disabled={extractedData.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                extractedData.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${
                isDarkMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              Save All to Database
            </button>
          </div>

          <div className="space-y-6">
            {extractedData.map((tutor, index) => {
              const userColor = getUserColor(tutor.tutorName);
              const isEditing = editingIndex === index;
              const dataToDisplay = isEditing ? editingData : tutor;

              return (
                <div
                  key={index}
                  className={`rounded-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl animate-slideInUp ${
                    isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                  }`}
                  style={{
                    borderLeftColor: isDarkMode ? userColor.dark : userColor.light,
                    borderLeftWidth: '6px',
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'backwards'
                  }}
                >
                  {/* Header */}
                  <div className={`p-6 ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-4">
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
                        <h2
                          className="text-2xl font-bold px-3 py-1 rounded"
                          style={{
                            backgroundColor: isDarkMode ? userColor.dark : userColor.light,
                            color: 'white',
                            display: 'inline-block'
                          }}
                        >
                          {dataToDisplay.tutorName}
                        </h2>
                      )}

                      <div className="flex gap-2">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => handleEditStart(index)}
                              className={`px-4 py-2 rounded font-medium transition ${
                                isDarkMode
                                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700'
                                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTutor(index)}
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
                  </div>

                  {/* Availability Grid */}
                  <div className="p-6">
                    <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Available Days & Times:
                    </h3>

                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full">
                        {/* Column Headers */}
                        <div className="grid gap-0" style={{ gridTemplateColumns: '120px repeat(5, 1fr)' }}>
                          <div className={`p-3 font-bold text-center text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                            Time
                          </div>
                          {days.map(day => (
                            <div
                              key={day}
                              className="p-3 font-bold text-center text-sm text-white"
                              style={{
                                backgroundColor: isDarkMode ? userColor.dark : userColor.light,
                                opacity: 0.8
                              }}
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Time Slots */}
                        {timeSlots.map((time, timeIdx) => (
                          <div key={time} className="grid gap-0" style={{ gridTemplateColumns: '120px repeat(5, 1fr)' }}>
                            <div
                              className={`p-3 text-center text-sm font-medium border-r ${
                                isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}
                            >
                              {time}
                            </div>
                            {days.map(day => {
                              const isAvailable = dataToDisplay.availability[time] && dataToDisplay.availability[time][day];
                              return (
                                <div
                                  key={`${time}-${day}`}
                                  onClick={() => {
                                    if (isEditing) {
                                      handleAvailabilityChange(day, time, !isAvailable);
                                    }
                                  }}
                                  className={`p-3 border cursor-pointer transition ${
                                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                  } ${
                                    isAvailable
                                      ? 'opacity-100'
                                      : 'opacity-30'
                                  }`}
                                  style={{
                                    backgroundColor: isAvailable
                                      ? (isDarkMode ? userColor.dark : userColor.light)
                                      : 'transparent'
                                  }}
                                >
                                  {isEditing && isAvailable && (
                                    <div className="text-white text-center font-bold">✓</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    {isEditing && (
                      <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Click individual time slots to toggle availability for this user.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Modal isOpen={modalOpen} title={modalTitle} message={modalMessage} type={modalType} onClose={() => setModalOpen(false)} />
    </div>
  );
}
