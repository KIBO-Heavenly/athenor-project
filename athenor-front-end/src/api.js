import { API_URL } from './config';
import { getAuthToken, logout } from './ProtectedRoute';

/**
 * Authenticated API fetch wrapper
 * Automatically includes JWT token and handles 401/403 errors
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle authentication errors
    if (response.status === 401) {
      // Token expired or invalid - logout and redirect to login
      console.warn('Session expired. Redirecting to login...');
      logout();
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
      // Forbidden - user doesn't have permission
      throw new Error('You do not have permission to access this resource.');
    }

    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (endpoint, options = {}) => {
    return apiFetch(endpoint, { ...options, method: 'GET' });
  },

  post: (endpoint, data, options = {}) => {
    return apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: (endpoint, data, options = {}) => {
    return apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (endpoint, options = {}) => {
    return apiFetch(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Upload a file with FormData - automatically includes auth header
   * Does NOT set Content-Type (browser sets it automatically with boundary)
   */
  upload: async (endpoint, formData, options = {}) => {
    const token = getAuthToken();
    const headers = { ...options.headers };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers,
      });
      
      // Handle authentication errors
      if (response.status === 401) {
        console.warn('Session expired. Redirecting to login...');
        logout();
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      }
      
      return response;
    } catch (error) {
      console.error('Upload API Error:', error);
      throw error;
    }
  },
};

export default api;
