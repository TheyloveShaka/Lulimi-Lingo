import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import HeroSection from '../components/landing/HeroSection'
import SignupCard from '../components/landing/SignupCard'
import InfoSection from '../components/landing/InfoSection'
import LoginModal from '../components/landing/LoginModal'
import TeacherSignupModal from '../components/landing/TeacherSignupModal'
import { signupTeacher } from '../services/userService'
import './LandingPage.css'

const LandingPage = ({ onSignup, onLogin }) => {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [loginMode, setLoginMode] = useState('student') // 'student' or 'teacher'
  const [showTeacherSignup, setShowTeacherSignup] = useState(false)

  // Signup and login both end by pushing the learner into the protected app area.
  const handleSignup = (userData) => {
    console.log('User signed up:', userData)
    onSignup(userData)
    navigate(userData.role === 'teacher' ? '/admin' : '/dashboard')
  }

  const handleLogin = (userData) => {
    onLogin(userData)
    setShowLogin(false)
    navigate(userData.role === 'teacher' ? '/admin' : '/dashboard')
  }

  const handleTeacherSignup = async (userData) => {
    console.log('👨‍🏫 handleTeacherSignup called with:', userData)
    const result = await signupTeacher(userData)
    console.log('📦 signupTeacher returned:', result)
    if (result.success) {
      console.log('✅ Teacher signup successful, navigating to admin')
      onSignup(result.user)
      navigate('/admin')
    } else {
      console.error('❌ Teacher signup failed:', result.error)
      throw new Error(result.error || 'Teacher signup failed')
    }
  }

  return (
    <div className="landing-page">
      {/* The landing page explains the product and gives entry points for each user type. */}
      <header className="landing-header">
        <div className="header-content">
          <div className="header-logo">
            <BookOpen size={28} />
            <span>Lulimi Lingo</span>
          </div>
          <nav className="header-nav">
            <motion.button
              className="nav-link student"
              onClick={() => { setLoginMode('student'); setShowLogin(true) }}
              whileHover={{ scale: 1.05 }}
            >
              Student Login
            </motion.button>
            <motion.button
              className="nav-link teacher"
              onClick={() => setShowTeacherSignup(true)}
              whileHover={{ scale: 1.05 }}
            >
              Teacher Portal
            </motion.button>
          </nav>
        </div>
      </header>

      {/* Hero, signup, and info sections are sequenced to guide first-time visitors. */}
      <HeroSection onGetStarted={() => document.getElementById('signup').scrollIntoView({ behavior: 'smooth' })} />
      
      <div id="signup" className="signup-section">
        <SignupCard onSignup={handleSignup} onShowLogin={() => { setLoginMode('student'); setShowLogin(true) }} />
      </div>
      
      <InfoSection />
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} mode={loginMode} />}
      
      {showTeacherSignup && (
        <TeacherSignupModal 
          onClose={() => setShowTeacherSignup(false)} 
          onSignup={handleTeacherSignup}
          onShowLogin={() => { setLoginMode('teacher'); setShowTeacherSignup(false); setShowLogin(true) }}
        />
      )}
      
      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2025 Local Language Learning. Empowering Uganda's students.</p>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#privacy">Privacy</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
