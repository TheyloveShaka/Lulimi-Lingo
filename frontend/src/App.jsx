import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LearningProvider } from './context/LearningContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import CurriculumPage from './pages/CurriculumPage'
import { getCurrentUser, logoutUser } from './services/userService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on app load
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

  return (
    <LearningProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage onSignup={handleSignup} onLogin={handleLogin} />} 
          />
          <Route 
            path="/curriculum" 
            element={<CurriculumPage />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard user={currentUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin" 
            element={isAuthenticated && (currentUser?.role === 'teacher' || currentUser?.role === 'admin') ? <AdminDashboard user={currentUser} /> : <Navigate to="/" />} 
          />
        </Routes>
      </Router>
    </LearningProvider>
  )
}

export default App
