import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import Modal from './Modal';
import { API_URL } from './config';
import malePfp from './assets/athenor-male-pfp.jpg';
import femalePfp from './assets/athenor-female-pfp.jpg';

export default function ManageUsers() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, tutors: 0, admins: 0, verified: 0, unverified: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("info");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      (user.fullName || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query) ||
      (user.role || '').toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/Users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/Users/count`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({ total: 0, tutors: 0, admins: 0, verified: 0, unverified: 0 });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchStats()]);
    // Small delay so user sees the spinner
    setTimeout(() => setRefreshing(false), 500);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteConfirmText("");
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      setModalTitle("Confirmation Required");
      setModalMessage("Please type 'delete' to confirm.");
      setModalType("warning");
      setModalOpen(true);
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/Users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user deleted themselves (convert both to strings for safe comparison)
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (String(currentUser.id) === String(userToDelete.id)) {
          // User deleted themselves - log out immediately
          localStorage.removeItem('user');
          window.location.href = '/';
          return;
        }
        
        setDeleteModalOpen(false);
        setUserToDelete(null);
        setDeleteConfirmText("");
        setModalTitle("Success");
        setModalMessage(data.message || "User deleted successfully.");
        setModalType("success");
        setModalOpen(true);
        // Refresh the user list
        fetchUsers();
        fetchStats();
      } else {
        setModalTitle("Error");
        setModalMessage(data.message || "Failed to delete user.");
        setModalType("error");
        setModalOpen(true);
      }
    } catch (err) {
      setModalTitle("Error");
      setModalMessage("Failed to delete user.");
      setModalType("error");
      setModalOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
        <NavBar title="Manage Users" showBackButton={true} onBackClick={() => navigate('/admin')} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className={`text-xl animate-pulse ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50 min-h-screen'}>
      <NavBar title="Manage Users" showBackButton={true} onBackClick={() => navigate('/admin')} />

      <section className="w-full py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-bold animate-slideInDown ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Registered Users
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View and manage all registered accounts
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
                  }`}
                />
                <svg
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
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
                  'Refresh'
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fadeIn animate-stagger-1">
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-blue-600'}`}>{stats.total}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.verified}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Verified</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{stats.unverified}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unverified</p>
            </div>
          </div>

          {/* Users Table */}
          <div className={`rounded-lg overflow-hidden shadow-lg animate-fadeIn animate-stagger-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</th>
                    <th className={`px-6 py-4 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                    <th className={`px-6 py-4 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className={`px-6 py-8 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {searchQuery ? 'No users match your search.' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => {
                      // Resolve profile picture - handle both stored names and full URLs
                      let profilePicSrc = null;
                      if (user.profilePicture) {
                        if (user.profilePicture === 'athenor-male-pfp') {
                          profilePicSrc = malePfp;
                        } else if (user.profilePicture === 'athenor-female-pfp') {
                          profilePicSrc = femalePfp;
                        } else if (user.profilePicture.startsWith('http') || user.profilePicture.startsWith('data:')) {
                          profilePicSrc = user.profilePicture;
                        } else {
                          // Fallback to male pfp for unknown values
                          profilePicSrc = malePfp;
                        }
                      } else {
                        // No profile picture - use default based on index
                        profilePicSrc = index % 2 === 0 ? malePfp : femalePfp;
                      }
                      
                      return (
                      <tr
                        key={user.id}
                        className={`border-t transition-colors ${
                          isDarkMode
                            ? 'border-gray-700 hover:bg-gray-700/50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className="flex items-center">
                            <img 
                              src={profilePicSrc} 
                              alt={user.fullName || 'User'}
                              className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-cyan-500"
                            />
                            <span className="font-medium">{user.fullName || 'N/A'}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isEmailVerified
                              ? isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                              : isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {user.isEmailVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {user.email === '***REMOVED***' ? (
                            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              Protected
                            </span>
                          ) : (
                            <button
                              onClick={() => openDeleteModal(user)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                                isDarkMode
                                  ? 'bg-red-900/50 text-red-300 hover:bg-red-800'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn" onClick={() => setDeleteModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className={`backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border animate-scaleIn ${
              isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/95 border-red-200'
            }`}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delete User?
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Are you sure you want to delete <strong>{userToDelete?.fullName || userToDelete?.email}</strong>?
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  This action cannot be undone.
                </p>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type <span className="font-bold text-red-500">"delete"</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type 'delete' here..."
                  className={`w-full border rounded-lg px-4 py-3 transition-all focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-red-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-red-500'
                  }`}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setUserToDelete(null);
                    setDeleteConfirmText("");
                  }}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting || deleteConfirmText.toLowerCase() !== 'delete'}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                    deleteConfirmText.toLowerCase() === 'delete'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : isDarkMode
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {deleting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
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
