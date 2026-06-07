// src/config.js

const getBackendURL = () => {
  // For production, use environment variable (set in Vercel)
  if (process.env.NODE_ENV === 'production') {
    // You can either hardcode or use REACT_APP_API_URL
    return process.env.REACT_APP_API_URL || 'https://ai-resume-builder-rlwj.onrender.com';
  }
  // Development
  return 'http://localhost:5000';
};

export const API_URL = getBackendURL();

// Helper function for API calls
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
};

export default API_URL;