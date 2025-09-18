const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// API utility function
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('urbansprout_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // Register user
  register: (userData) => 
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Login user
  login: (credentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // Google sign in (legacy)
  googleSignIn: (googleData) =>
    apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    }),

  // Firebase ID token verification (preferred)
  firebaseAuth: (payload) =>
    apiCall('/auth/firebase-auth', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Get user profile
  getProfile: () => apiCall('/auth/profile'),

  // Update profile
  updateProfile: (profileData) =>
    apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Change password
  changePassword: (passwordData) =>
    apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),

  // Update preferences
  updatePreferences: (preferences) =>
    apiCall('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),
};

export default apiCall;