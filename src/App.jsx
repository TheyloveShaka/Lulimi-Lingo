import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import CurriculumPage from './pages/CurriculumPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const handleSignup = (userData) => {
    // Store user data in localStorage
    const users = JSON.parse(localStorage.getItem('lulimiLingoUsers') || '[]')
    users.push(userData)
    localStorage.setItem('lulimiLingoUsers', JSON.stringify(users))
    
    setCurrentUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogin = (userData) => {
    setCurrentUser(userData)
    setIsAuthenticated(true)
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<LandingPage onSignup={handleSignup} onLogin={handleLogin} />} 
        />
        <Route 
          path="/curriculum" 
          element={<CurriculumPage />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard user={currentUser} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
