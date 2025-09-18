import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Leaf, User, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Plant Suggestion', path: '/plant-suggestion', requiresAuth: true },
    { name: 'Store', path: '/store', requiresAuth: true },
    { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
  ]

  const handleNavClick = (item) => {
    if (item.requiresAuth && !isAuthenticated) {
      navigate('/signup')
    } else {
      navigate(item.path)
    }
  }

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const getDashboardPath = () => {
    if (!user) return '/dashboard'
    switch (user.role) {
      case 'admin': return '/admin/dashboard'
      case 'vendor': return '/vendor/dashboard'
      case 'expert': return '/expert/dashboard'
      default: return '/dashboard'
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'vendor': return 'bg-green-100 text-green-800'
      case 'expert': return 'bg-purple-100 text-purple-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-forest-green-500 rounded-full"
            >
              <Leaf className="h-6 w-6 text-cream-100" />
            </motion.div>
            <span className="text-xl font-bold text-forest-green-600">
              UrbanSprout
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors duration-200",
                  isActive(item.path)
                    ? "text-forest-green-600"
                    : "text-muted-foreground hover:text-forest-green-600"
                )}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-green-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
            
            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-forest-green-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-cream-100" />
                      </div>
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </div>
                    </div>
                  </button>
                  
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-1 z-50"
                    >
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        Profile
                      </Link>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-accent transition-colors flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-muted-foreground hover:text-forest-green-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium text-cream-100 bg-forest-green-500 rounded-md hover:bg-forest-green-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-forest-green-600 hover:bg-accent transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  handleNavClick(item)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(item.path)
                    ? "text-forest-green-600 bg-accent"
                    : "text-muted-foreground hover:text-forest-green-600 hover:bg-accent"
                )}
              >
                {item.name}
              </button>
            ))}
            
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 border-b border-border">
                    <div className="flex items-center space-x-2">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-forest-green-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-cream-100" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">{user.name}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-forest-green-600 hover:bg-accent rounded-md transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-forest-green-600 hover:bg-accent rounded-md transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-accent rounded-md transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-forest-green-600 hover:bg-accent rounded-md transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-cream-100 bg-forest-green-500 hover:bg-forest-green-600 rounded-md transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  )
}

export default Navbar