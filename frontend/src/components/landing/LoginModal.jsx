import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/userService'
import './LoginModal.css'

const LoginModal = ({ onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const result = await loginUser(formData)
      
      if (result.success && result.user) {
        // Store user data (without password)
        const userData = {
          _id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          classLevel: result.user.classLevel,
          language: result.user.language,
          completedLessons: result.user.completedLessons || [],
          completedTopics: result.user.completedTopics || [],
          progressPercentage: result.user.progressPercentage || 0
        }
        localStorage.setItem('lulimiLingoCurrentUser', JSON.stringify(userData))
        
        onLogin(userData)
        navigate('/dashboard')
      } else {
        setErrors({ email: result.error || 'Login failed' })
      }
    } catch (error) {
      setErrors({ email: error.message || 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="login-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-header">
          <h2>Welcome Back!</h2>
          <p>Log in to continue your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <motion.button
            type="submit"
            className="login-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={20} className="spinning" /> : <LogIn size={20} />}
            <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
          </motion.button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <button onClick={onClose} className="switch-link">Sign up</button></p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LoginModal
