import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'

// Import page components
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import PlantSuggestion from './pages/PlantSuggestion'
import Unauthorized from './pages/Unauthorized'
import Admin from './pages/Admin'
import Blog from './pages/Blog'
import Store from './pages/Store'
import Profile from './pages/Profile'

// Import dashboard components
import AdminDashboard from './pages/dashboard/AdminDashboard'
import BeginnerDashboard from './pages/dashboard/BeginnerDashboard'
import ExpertDashboard from './pages/dashboard/ExpertDashboard'
import VendorDashboard from './pages/dashboard/VendorDashboard'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// Dashboard Component - routes to appropriate dashboard based on user role
const Dashboard = () => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  const userRole = user.role || localStorage.getItem('urbansprout_user_role')
  
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />
    case 'expert':
      return <ExpertDashboard />
    case 'vendor':
      return <VendorDashboard />
    case 'beginner':
    default:
      return <BeginnerDashboard />
  }
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading UrbanSprout...</p>
    </div>
  </div>
)

// Main App Component
const App = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/community" element={<Blog />} />
          <Route path="/store" element={<Store />} />
          <Route path="/plant-suggestion" element={<PlantSuggestion />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Profile Route - Protected */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App