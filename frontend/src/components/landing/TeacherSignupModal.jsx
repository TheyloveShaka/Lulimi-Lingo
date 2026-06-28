import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Building2, Eye, EyeOff } from 'lucide-react'
import { loginTeacher } from '../../services/userService'
import './TeacherSignupModal.css'

const TeacherSignupModal = ({ onClose, onSignup, onShowLogin }) => {
  const [isLogin, setIsLogin] = useState(false)
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: ''
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignupChange = (e) => {
    // Separate signup state keeps the teacher form easy to switch in and out of login mode.
    const { name, value } = e.target
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleLoginChange = (e) => {
    // Login mode uses its own state so the two forms never collide.
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Quick client checks catch the most obvious teacher signup issues.
    if (!signupData.name || !signupData.email || !signupData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const result = await onSignup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        schoolName: signupData.schoolName,
        role: 'teacher'
      })
      setLoading(false)
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
      console.error('Teacher signup error details:', err)
      setLoading(false)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Quick client checks catch empty teacher login submissions.
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const result = await loginTeacher({
        email: loginData.email,
        password: loginData.password
      })

      if (result.success) {
        console.log('✅ Teacher login successful, calling onSignup')
        onSignup(result.user)
        setLoading(false)
      } else {
        setError(result.error || 'Login failed. Please check your credentials.')
        console.error('Teacher login failed:', result.error)
        setLoading(false)
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
      console.error('Teacher login error:', err)
      setLoading(false)
    }
  }

  const toggleMode = () => {
    // Switching modes resets errors and password visibility for a clean form state.
    setIsLogin(!isLogin)
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="teacher-signup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="teacher-signup-modal"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="modal-header">
            <h2>Teacher Portal</h2>
            <p>{isLogin ? 'Log in to your account' : 'Create your account to manage resources and track student progress'}</p>
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="teacher-signup-form">
            {!isLogin ? (
              <>
                <div className="form-group">
                  <label>Full Name *</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>School Name (Optional)</label>
                  <div className="input-wrapper">
                    <Building2 size={18} />
                    <input
                      type="text"
                      name="schoolName"
                      placeholder="Your school name"
                      value={signupData.schoolName}
                      onChange={handleSignupChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="At least 6 characters"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Creating Account...' : 'Create Teacher Account'}
                </motion.button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Email Address *</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </motion.button>
              </>
            )}
          </form>

          <div className="modal-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={toggleMode} className="link-btn">
                {isLogin ? 'Sign up' : 'Teacher Login'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TeacherSignupModal
