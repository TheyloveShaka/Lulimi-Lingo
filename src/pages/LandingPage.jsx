import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroSection from '../components/landing/HeroSection'
import SignupCard from '../components/landing/SignupCard'
import InfoSection from '../components/landing/InfoSection'
import LoginModal from '../components/landing/LoginModal'
import './LandingPage.css'

const LandingPage = ({ onSignup, onLogin }) => {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)

  const handleSignup = (userData) => {
    console.log('User signed up:', userData)
    onSignup(userData)
    navigate('/dashboard')
  }

  const handleLogin = (userData) => {
    onLogin(userData)
    setShowLogin(false)
  }

  return (
    <div className="landing-page">
      <HeroSection onGetStarted={() => document.getElementById('signup').scrollIntoView({ behavior: 'smooth' })} />
      
      <div id="signup" className="signup-section">
        <SignupCard onSignup={handleSignup} onShowLogin={() => setShowLogin(true)} />
      </div>
      
      <InfoSection />
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
      
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
