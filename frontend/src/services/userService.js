/**
 * User Service - Handles user authentication and profile management
 */

const NODE_BACKEND_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://lulimi-lingo-production.up.railway.app'

/**
 * Sign up new user
 * @param {Object} userData - { name, email, password, classLevel, language, proficiencyLevel }
 * @returns {Promise<Object>} - { success, user, token }
 */
export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${NODE_BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        classLevel: userData.class || 'S1',
        language: userData.language || 'luganda',
        proficiencyLevel: userData.proficiencyLevel || 'beginner'
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed')
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token)
    }

    return data
  } catch (error) {
    console.error('Signup error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Login user with email and password
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { success, user, token }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${NODE_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token)
    }

    return data
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get current authenticated user
 * @returns {Promise<Object>} - { success, user }
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      return { success: false, error: 'No token found' }
    }

    const response = await fetch(`${NODE_BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      // Token might be expired
      localStorage.removeItem('authToken')
      throw new Error(data.error || 'Failed to get user')
    }

    return data
  } catch (error) {
    console.error('Get current user error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update user progress
 * @param {Object} progress - { completedLessons, completedTopics }
 * @returns {Promise<Object>} - { success, user }
 */
export const updateUserProgress = async (progress) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const response = await fetch(`${NODE_BACKEND_URL}/api/auth/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(progress)
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update progress')
    }

    return data
  } catch (error) {
    console.error('Update progress error:', error)
    return { success: false, error: error.message }
  }
}


/**
 * Teacher signup
 * @param {Object} teacherData - { name, email, password, schoolName }
 * @returns {Promise<Object>} - { success, user, token, error }
 */
/**
 * Teacher login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { success, user, token, error }
 */
export const loginTeacher = async (credentials) => {
  try {
    const url = `${NODE_BACKEND_URL}/api/auth/login`
    console.log('🔵 Teacher login attempt:', { url, email: credentials.email })
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    })

    const data = await response.json()
    console.log('📄 Login response:', { status: response.status, user: data.user?.role })
    
    if (!response.ok) {
      const errorMsg = data.error || 'Teacher login failed'
      console.error('❌ Teacher login error:', errorMsg)
      throw new Error(errorMsg)
    }

    // Check if user is actually a teacher
    if (data.user.role !== 'teacher' && data.user.role !== 'admin') {
      console.error('❌ User is not a teacher:', data.user.role)
      throw new Error('This account is not a teacher account')
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('lulimiLingoCurrentUser', JSON.stringify(data.user))
      console.log('✅ Teacher login success:', data.user.name)
    }

    return { success: true, ...data }
  } catch (error) {
    console.error('❌ Teacher login exception:', error.message)
    return { success: false, error: error.message }
  }
}

export const signupTeacher = async (teacherData) => {
  try {
    const url = `${NODE_BACKEND_URL}/api/auth/teacher-signup`
    console.log('🔵 Teacher signup attempt:', { url, email: teacherData.email })
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: teacherData.name,
        email: teacherData.email,
        password: teacherData.password,
        schoolName: teacherData.schoolName || 'Not specified',
        role: 'teacher'
      })
    })

    const data = await response.json()
    console.log('📄 Response:', { status: response.status, data })
    
    if (!response.ok) {
      const errorMsg = data.error || 'Teacher signup failed'
      console.error('❌ Teacher signup error:', errorMsg)
      throw new Error(errorMsg)
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('lulimiLingoCurrentUser', JSON.stringify(data.user))
      console.log('✅ Teacher signup success:', data.user.name)
    }

    return { success: true, ...data }
  } catch (error) {
    console.error('❌ Teacher signup exception:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('lulimiLingoCurrentUser')
  return { success: true }
}

