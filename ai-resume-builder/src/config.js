// src/config.js

// Get the backend URL based on environment
const getBackendURL = () => {
  // Production - Use your actual Render backend URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://ai-resume-builder-rlwj.onrender.com';  // ← YOUR ACTUAL BACKEND URL
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