import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaEye, FaEyeSlash, FaLeaf } from 'react-icons/fa';
import { signInWithGoogle, getGoogleRedirectResult } from '../../config/firebase';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validation';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle redirect result from Google Sign-In
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getGoogleRedirectResult();
        if (result && result.user) {
          console.log('Google redirect result received:', result.user.email);
          await processGoogleUser(result.user);
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
        setError('Google Sign-In failed. Please try again.');
      }
    };

    handleRedirectResult();
  }, []);

  // Process Google user authentication
  const processGoogleUser = async (user) => {
    setLoading(true);
    setError('');
    
    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      console.log('Processing Google user:', user.email);

      const response = await authAPI.firebaseAuth({
        idToken,
        email: user.email, // Add email as fallback
        role: 'beginner',
        name: user.displayName || 'User'
      });
      
      if (response.success) {
        // Support both direct and data-wrapped responses
        const token = response.token || response.data?.token;
        const userData = response.user || response.data?.user;
        
        if (token && userData) {
          console.log('Google sign-in successful:', userData.email);
          login(userData, token);
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response format from server');
        }
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(formData);
      
      if (response.success) {
        login(response.data.user, response.data.token);
        
        // Redirect based on user role
        const userRole = response.data.user.role;
        switch (userRole) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'vendor':
            navigate('/vendor/dashboard');
            break;
          case 'expert':
            navigate('/expert/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Initiating Google Sign-In...');
      const result = await signInWithGoogle();
      
      // If result is null, it means redirect method was used
      if (result === null) {
        console.log('Redirect method used, waiting for page reload...');
        return; // The page will redirect and reload
      }
      
      // If we get here, popup method succeeded
      if (result && result.user) {
        console.log('Popup method successful:', result.user.email);
        await processGoogleUser(result.user);
      } else {
        throw new Error('No user data received from Google');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Google Sign-In failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <FaLeaf className="text-4xl text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">UrbanSprout</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-green-600 hover:text-green-500"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-green-50 to-blue-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaGoogle className="h-4 w-4 text-red-500 mr-2" />
            Sign in with Google
          </button>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;