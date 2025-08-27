// Environment variables and app constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Online Tutoring Platform';

// Helper function to construct image URLs
export const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  return `${API_BASE_URL}${imagePath}`;
};

// Helper function to construct API URLs
export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};
