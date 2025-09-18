import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('urbansprout_token'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get the ID token from Firebase
        const idToken = await firebaseUser.getIdToken();
        
        // Store user info
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });
        
        // Store token if it's a Firebase user
        if (idToken) {
          localStorage.setItem('firebase_token', idToken);
        }
      } else {
        setUser(null);
        localStorage.removeItem('firebase_token');
      }
      setLoading(false);
    });

    // Check for existing backend token
    const backendToken = localStorage.getItem('urbansprout_token');
    const userData = localStorage.getItem('urbansprout_user');
    
    if (backendToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(backendToken);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('urbansprout_token');
        localStorage.removeItem('urbansprout_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = (userData, authToken) => {
    // Check if user has a saved profile photo
    const savedUser = localStorage.getItem('urbansprout_user');
    let finalUserData = userData;
    
    if (savedUser) {
      try {
        const parsedSavedUser = JSON.parse(savedUser);
        // Preserve profile photo if it exists
        if (parsedSavedUser.profilePhoto && !userData.profilePhoto) {
          finalUserData = { ...userData, profilePhoto: parsedSavedUser.profilePhoto };
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    }
    
    setUser(finalUserData);
    setToken(authToken);
    localStorage.setItem('urbansprout_token', authToken);
    localStorage.setItem('urbansprout_user', JSON.stringify(finalUserData));
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('urbansprout_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('urbansprout_token');
    localStorage.removeItem('urbansprout_user');
    localStorage.removeItem('firebase_token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isVendor: user?.role === 'vendor',
    isExpert: user?.role === 'expert',
    isBeginner: user?.role === 'beginner'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};