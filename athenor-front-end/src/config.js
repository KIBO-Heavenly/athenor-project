// API Configuration
// This file centralizes the API URL configuration for all environment

// Fallback to production backend if env var not available
const defaultBackendUrl = 'https://athenor-backend-c5gkhub7dwdyf8ft.centralus-01.azurewebsites.net';

export const API_URL = import.meta.env.VITE_API_URL || defaultBackendUrl;

// Export for easy use throughout the app
export default {
  API_URL,
  endpoints: {
    schedule: `${API_URL}/api/Schedule`,
    auth: `${API_URL}/api/Auth`,
    dataImport: `${API_URL}/api/DataImport`,
  }
};
