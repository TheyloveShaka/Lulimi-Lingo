/**
 * Curriculum Service
 * 
 * Handles all curriculum-related API calls to the backend.
 * Loads curriculum structure, generates content using curriculum templates.
 */

// Curriculum calls hit the public Node API surface.
const API_BASE = import.meta.env.VITE_API_URL || 'https://lulimi-lingo-production.up.railway.app/api'

const getCurrentLanguage = () => {
  try {
    // Let the syllabus-driven generators match the learner's chosen language.
    const user = JSON.parse(localStorage.getItem('lulimiLingoCurrentUser') || 'null')
    return user?.language || 'luganda'
  } catch {
    return 'luganda'
  }
}

/**
 * Get full curriculum overview (S1-S4)
 */
export async function getCurriculum() {
  try {
    // This loads the full class map used by the curriculum page.
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
    // Class-specific calls keep the UI from loading more syllabus than it needs.
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
    // Term-level lookup drives the milestone and lesson selectors.
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
    // Milestones hold the detailed outcomes and scenario prompts.
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
    // Lesson generation uses curriculum metadata so AI content stays aligned.
    const response = await fetch(`${API_BASE}/content/lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classLevel,
        term,
        milestoneId,
        topic,
        language: getCurrentLanguage()
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
    // Quiz generation reuses the same milestone data for consistency.
    const response = await fetch(`${API_BASE}/content/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classLevel,
        term,
        milestoneId,
        topic,
        questionCount,
        language: getCurrentLanguage()
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
    // Practice generation is scenario-based so learners can apply the lesson.
    const response = await fetch(`${API_BASE}/content/practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classLevel,
        term,
        milestoneId,
        topic,
        scenarioCount,
        language: getCurrentLanguage()
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
    // Resources are lightweight references that support the main lesson flow.
    const response = await fetch(`${API_BASE}/content/resource`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classLevel,
        topic,
        resourceType,
        language: getCurrentLanguage()
      })
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return await response.json()
  } catch (err) {
    console.error('Error generating resource:', err.message)
    return { success: false, error: err.message }
  }
}
