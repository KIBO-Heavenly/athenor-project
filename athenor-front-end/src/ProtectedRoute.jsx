import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Authentication utility functions
 */

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    logout(); // Auto-logout if token expired
    return false;
  }
  return true;
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const isAdmin = () => {
  return getUserRole() === 'Admin';
};

export const isTutor = () => {
  return getUserRole() === 'Tutor';
};

/**
 * Get the dashboard path based on user role
 * Use this for consistent navigation back to dashboard
 */
export const getDashboardPath = () => {
  const role = getUserRole();
  return role === 'Admin' ? '/admin-dashboard' : '/tutor-dashboard';
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const setAuthData = (token, user) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Protected Route Component - Requires Authentication
 */
export function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }
  return children;
}

/**
 * Admin-Only Route Component - Requires Admin Role
 */
export function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  if (!isAdmin()) {
    // Redirect to tutor dashboard if not admin
    return <Navigate to="/tutor-dashboard" replace />;
  }
  
  return children;
}

/**
 * Guest Route Component - Only accessible when NOT logged in
 * (Used for login, register pages)
 */
export function GuestRoute({ children }) {
  if (isAuthenticated()) {
    const role = getUserRole();
    // Redirect to appropriate dashboard if already logged in
    if (role === 'Admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/tutor-dashboard" replace />;
  }
  return children;
}
