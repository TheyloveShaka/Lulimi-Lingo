import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * Sign up new user
 * POST /api/auth/signup
 */
export const signup = async (req, res) => {
  const { name, email, password, classLevel, language, proficiencyLevel, lin } = req.body

  try {
    // Keep validation close to the controller so bad requests fail early.
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
    }

    // The LIN identifies the learner in school records, so we capture it at signup.
    const normalizedLin = String(lin || '').trim().toUpperCase()
    if (!normalizedLin) {
      return res.status(400).json({ success: false, error: 'Learner Identification Number (LIN) is required' })
    }

    // A learner is unique by both email and LIN.
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { lin: normalizedLin }]
    })
    if (existingUser) {
      const conflict = existingUser.lin === normalizedLin
        ? 'A student with this LIN already exists'
        : 'User with this email already exists'
      return res.status(400).json({ success: false, error: conflict })
    }

    // Persist the learner profile with defaults that match the curriculum.
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      lin: normalizedLin,
      password,
      role: 'student',
      classLevel: classLevel || 'S1',
      language: language || 'luganda',
      proficiencyLevel: proficiencyLevel || 'beginner',
      completedLessons: [],
      completedTopics: []
    })

    // The token lets the frontend re-open the session after refresh.
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })

    return res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        lin: user.lin,
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
  // `email` may carry either an email address or a LIN, so we treat it as a
  // generic identifier and accept an explicit `lin` field too.
  const { email, password, lin } = req.body
  const identifier = String(lin || email || '').trim()

  try {
    // Login accepts an identifier (email or LIN) plus password.
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Email or LIN and password are required' })
    }

    // Look up the learner by email or LIN before checking the password hash.
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { lin: identifier.toUpperCase() }]
    })
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    
    // Password verification stays inside the model so hashing stays encapsulated.
    const isPasswordValid = await user.verifyPassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }
    
    // Reissue a token after login so the browser can treat the session as fresh.
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
    
    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        lin: user.lin,
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
    // This endpoint is what the frontend uses to restore the signed-in user.
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
        lin: user.lin,
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
    
    // Keep the stored progress summary lightweight so it is fast to read back.
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
    // Teachers use the same account base, but get a different role and dashboard.
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' })
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
    }
    
    // Reuse the same email uniqueness rule for teachers.
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' })
    }
    
    // Teacher accounts start with the first class level they manage.
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
    
    // Teacher tokens work the same way as student tokens.
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