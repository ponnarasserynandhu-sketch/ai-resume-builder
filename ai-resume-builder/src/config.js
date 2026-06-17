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

// Helper function to get a full image URL from a relative path
// This fixes mixed content warnings on HTTPS production sites
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If the URL points to localhost (old absolute URLs), replace with current API_URL
  if (path.startsWith('http://localhost:5000')) {
    return path.replace('http://localhost:5000', API_URL);
  }
  
  // If it's already a full URL (http or https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path starting with /uploads/, prepend API_URL
  if (path.startsWith('/uploads/')) {
    return `${API_URL}${path}`;
  }
  
  // If it's just a filename, assume it's under /uploads/
  if (!path.startsWith('/')) {
    return `${API_URL}/uploads/${path}`;
  }
  
  // Otherwise, treat as relative path from root
  return `${API_URL}${path}`;
};

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