/**
 * Curriculum Service
 * 
 * Handles all curriculum-related API calls to the backend.
 * Loads curriculum structure, generates content using curriculum templates.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://lulimi-lingo-production.up.railway.app/api'

/**
 * Get full curriculum overview (S1-S4)
 */
export async function getCurriculum() {
  try {
    const response = await fetch(`${API_BASE}/curriculum`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (err) {
    console.error('Error fetching curriculum:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Get specific class curriculum (S1/S2/S3/S4)
 */
export async function getClassCurriculum(classLevel) {
  try {
    const response = await fetch(`${API_BASE}/curriculum/${classLevel}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (err) {
    console.error(`Error fetching ${classLevel} curriculum:`, err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Get specific term curriculum
 */
export async function getTermCurriculum(classLevel, term) {
  try {
    const response = await fetch(`${API_BASE}/curriculum/${classLevel}/${term}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (err) {
    console.error(`Error fetching ${classLevel} ${term} curriculum:`, err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Get milestone details with learning outcomes and scenarios
 */
export async function getMilestoneDetails(classLevel, term, milestoneId) {
  try {
    const response = await fetch(`${API_BASE}/curriculum/${classLevel}/${term}/${milestoneId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (err) {
    console.error(`Error fetching milestone ${milestoneId}:`, err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Generate lesson based on curriculum milestone
 */
export async function generateCurriculumLesson(classLevel, term, milestoneId, topic) {
  try {
    const response = await fetch(`${API_BASE}/content/lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classLevel,
        term,
        milestoneId,
        topic
      })
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (err) {
    console.error('Error generating lesson:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Generate quiz based on curriculum milestone
 */
export async function generateCurriculumQuiz(classLevel, term, milestoneId, topic, questionCount = 15) {
  try {
    const response = await fetch(`${API_BASE}/content/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classLevel,
        term,
        milestoneId,
        topic,
        questionCount
      })
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (err) {
    console.error('Error generating quiz:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Generate practice exercises based on curriculum milestone
 */
export async function generateCurriculumPractice(classLevel, term, milestoneId, topic, scenarioCount = 4) {
  try {
    const response = await fetch(`${API_BASE}/content/practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classLevel,
        term,
        milestoneId,
        topic,
        scenarioCount
      })
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (err) {
    console.error('Error generating practice:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Generate resource (vocabulary list, grammar guide, etc.)
 */
export async function generateCurriculumResource(classLevel, topic, resourceType = 'vocabulary_list') {
  try {
    const response = await fetch(`${API_BASE}/content/resource`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classLevel,
        topic,
        resourceType
      })
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (err) {
    console.error('Error generating resource:', err.message)
    return { success: false, error: err.message }
  }
}
