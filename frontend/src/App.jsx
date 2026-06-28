import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LearningProvider } from './context/LearningContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import CurriculumPage from './pages/CurriculumPage'
import { getCurrentUser, logoutUser } from './services/userService'

// Wraps a page so route changes cross-fade instead of snapping.
const PageFade = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    style={{ minHeight: '100vh' }}
  >
    {children}
  </motion.div>
)

// AnimatePresence needs the Routes to live under a component that can read the
// current location, so transitions fire on every path change.
const AnimatedRoutes = ({ isAuthenticated, currentUser, handleSignup, handleLogin }) => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={isAuthenticated
            ? <Navigate to="/dashboard" />
            : <PageFade><LandingPage onSignup={handleSignup} onLogin={handleLogin} /></PageFade>}
        />
        <Route path="/curriculum" element={<PageFade><CurriculumPage /></PageFade>} />
        <Route
          path="/dashboard"
          element={isAuthenticated
            ? <PageFade><Dashboard user={currentUser} /></PageFade>
            : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={isAuthenticated && (currentUser?.role === 'teacher' || currentUser?.role === 'admin')
            ? <PageFade><AdminDashboard user={currentUser} /></PageFade>
            : <Navigate to="/" />}
        />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // This runs once so the app can restore the session before showing pages.
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        const result = await getCurrentUser()
        if (result.success && result.user) {
          setCurrentUser(result.user)
          setIsAuthenticated(true)
        } else {
          // Token is invalid or expired
          logoutUser()
          setIsAuthenticated(false)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleSignup = (userData) => {
    setCurrentUser(userData)
    localStorage.setItem('lulimiLingoCurrentUser', JSON.stringify(userData))
    setIsAuthenticated(true)
  }

  const handleLogin = (userData) => {
    setCurrentUser(userData)
    localStorage.setItem('lulimiLingoCurrentUser', JSON.stringify(userData))
    setIsAuthenticated(true)
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#666'
        }}>Loading...</div>
      </div>
    )
  }

  // The router switches between public learning pages and protected dashboard pages.
  return (
    <LearningProvider>
      <Router>
        <AnimatedRoutes
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          handleSignup={handleSignup}
          handleLogin={handleLogin}
        />
      </Router>
    </LearningProvider>
  )
}

export default App
