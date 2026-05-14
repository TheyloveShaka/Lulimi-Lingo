import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, GraduationCap, Loader2 } from 'lucide-react'
import { signupUser } from '../../services/userService'
import './SignupCard.css'

const SignupCard = ({ onSignup, onShowLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    class: 'S1',
    language: 'luganda',
    proficiencyLevel: 'beginner'
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const classes = ['S1', 'S2', 'S3', 'S4']
  const languages = [
    { value: 'luganda', label: 'Luganda' },
    { value: 'runyankole', label: 'Runyankole' }
  ]
  const proficiencyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    try {
      const result = await signupUser(formData)
      
      if (result.success && result.user) {
        // Store user data (without password)
        const userData = {
          _id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          classLevel: result.user.classLevel,
          language: result.user.language,
          proficiencyLevel: result.user.proficiencyLevel,
          completedLessons: result.user.completedLessons || [],
          completedTopics: result.user.completedTopics || [],
          progressPercentage: result.user.progressPercentage || 0
        }
        localStorage.setItem('lulimiLingoCurrentUser', JSON.stringify(userData))
        
        onSignup(userData)
      } else {
        setErrors({ email: result.error || 'Failed to create account' })
      }
    } catch (error) {
      setErrors({ email: error.message || 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="signup-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="card-header">
        <h2>Start Your Journey</h2>
        <p>Create your account and begin learning today</p>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <div className={`input-wrapper ${errors.name ? 'error' : ''}`}>
            <User size={20} className="input-icon" />
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
            <Mail size={20} className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
            <Lock size={20} className="input-icon" />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="class">Select Your Class</label>
          <div className="input-wrapper">
            <GraduationCap size={20} className="input-icon" />
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              disabled={isLoading}
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls} - Senior {cls.substring(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="language">Select Language</label>
          <div className="input-wrapper">
            <GraduationCap size={20} className="input-icon" />
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              disabled={isLoading}
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="proficiencyLevel">Your Level</label>
          <div className="input-wrapper">
            <GraduationCap size={20} className="input-icon" />
            <select
              id="proficiencyLevel"
              name="proficiencyLevel"
              value={formData.proficiencyLevel}
              onChange={handleChange}
              disabled={isLoading}
            >
              {proficiencyLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.button
          type="submit"
          className="submit-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={20} className="spinning" /> : null}
          <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
        </motion.button>
      </form>

      <div className="divider">
        <span>or continue with</span>
      </div>

      <div className="social-login">
        <motion.button
          className="social-btn"
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Coming Soon</span>
        </motion.button>
      </div>

      <div className="card-footer">
        <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onShowLogin(); }} className="login-link">Log in here</a></p>
      </div>
    </motion.div>
  )
}

export default SignupCard
