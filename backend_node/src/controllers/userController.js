import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * Sign up new user
 * POST /api/auth/signup
 */
export const signup = async (req, res) => {
  const { name, email, password, classLevel, language, proficiencyLevel } = req.body
  
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' })
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' })
    }
    
    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: 'student',
      classLevel: classLevel || 'S1',
      language: language || 'luganda',
      proficiencyLevel: proficiencyLevel || 'beginner',
      completedLessons: [],
      completedTopics: []
    })
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
    
    return res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classLevel: user.classLevel,
        language: user.language,
        proficiencyLevel: user.proficiencyLevel,
        completedLessons: user.completedLessons,
        completedTopics: user.completedTopics,
        progressPercentage: user.progressPercentage
      },
      token
    })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * Log in user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  const { email, password } = req.body
  
  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }
    
    // Verify password
    const isPasswordValid = await user.verifyPassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
    
    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classLevel: user.classLevel,
        language: user.language,
        proficiencyLevel: user.proficiencyLevel,
        completedLessons: user.completedLessons,
        completedTopics: user.completedTopics,
        progressPercentage: user.progressPercentage
      },
      token
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    
    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classLevel: user.classLevel,
        language: user.language,
        proficiencyLevel: user.proficiencyLevel,
        completedLessons: user.completedLessons,
        completedTopics: user.completedTopics,
        progressPercentage: user.progressPercentage
      }
    })
  } catch (err) {
    console.error('Get user error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * Update user progress
 * PUT /api/auth/progress
 */
export const updateProgress = async (req, res) => {
  try {
    const { completedLessons, completedTopics } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        completedLessons: completedLessons || [],
        completedTopics: completedTopics || [],
        progressPercentage: completedLessons ? (completedLessons.length / 48) * 100 : 0,
        updatedAt: Date.now()
      },
      { new: true }
    )
    
    return res.json({
      success: true,
      user: {
        _id: user._id,
        completedLessons: user.completedLessons,
        completedTopics: user.completedTopics,
        progressPercentage: user.progressPercentage
      }
    })
  } catch (err) {
    console.error('Update progress error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
}
/**
 * Teacher/Admin signup
 * POST /api/auth/teacher-signup
 */
export const teacherSignup = async (req, res) => {
  const { name, email, password, schoolName, classLevels } = req.body
  
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' })
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' })
    }
    
    // Create new teacher user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: 'teacher',
      classLevel: classLevels?.[0] || 'S1',
      language: 'luganda',
      proficiencyLevel: 'beginner',
      completedLessons: [],
      completedTopics: [],
      assignedStudents: []
    })
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
    
    return res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolName: schoolName || 'Not specified'
      },
      token
    })
  } catch (err) {
    console.error('Teacher signup error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
}