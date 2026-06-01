// src/config.js

// Get the backend URL based on environment
const getBackendURL = () => {
  // Production - Replace this with your actual Render backend URL after deployment
  if (process.env.NODE_ENV === 'production') {
    // TODO: Replace with your actual Render backend URL
    // Example: 'https://ai-resume-backend.onrender.com'
    return 'https://your-backend-url.onrender.com';
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