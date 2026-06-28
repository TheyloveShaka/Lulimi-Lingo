/**
 * Progress Service - Save quiz/practice progress
 */

// Progress updates are saved to the same backend that serves the curriculum and AI.
const NODE_BACKEND_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://lulimi-lingo-production.up.railway.app'

export const upsertProgress = async (userId, payload) => {
  try {
    if (!userId) {
      return { success: false, error: 'Missing userId' }
    }

    // Progress is written per user so quizzes and lessons can resume later.
    const response = await fetch(`${NODE_BACKEND_URL}/api/progress/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update progress')
    }

    return data
  } catch (error) {
    console.error('Progress update error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Fetch all stored progress records for a learner from the backend.
 * Each record is one user/week/language document with quiz & practice attempts.
 */
export const getProgress = async (userId) => {
  try {
    if (!userId) return { success: false, error: 'Missing userId', progress: [] }

    const response = await fetch(`${NODE_BACKEND_URL}/api/progress/${userId}`)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load progress')
    }
    return { success: true, progress: Array.isArray(data.progress) ? data.progress : [] }
  } catch (error) {
    console.error('Progress fetch error:', error)
    return { success: false, error: error.message, progress: [] }
  }
}

// The whole-curriculum lesson target (used to express overall completion as a %).
export const TOTAL_LESSONS = 48

// Count how many distinct calendar days appear in a list of ISO dates, then
// reduce that to a "current streak" of consecutive days ending today/yesterday.
const computeStreak = (dates) => {
  const days = Array.from(
    new Set(
      dates
        .filter(Boolean)
        .map((d) => new Date(d))
        .filter((d) => !Number.isNaN(d.getTime()))
        .map((d) => d.toDateString())
    )
  )
    .map((s) => new Date(s))
    .sort((a, b) => b - a)

  if (days.length === 0) return 0

  const oneDay = 24 * 60 * 60 * 1000
  const today = new Date(new Date().toDateString())
  const diffFromToday = Math.round((today - days[0]) / oneDay)
  // Streak only counts if the most recent activity was today or yesterday.
  if (diffFromToday > 1) return 0

  let streak = 1
  for (let i = 1; i < days.length; i += 1) {
    const gap = Math.round((days[i - 1] - days[i]) / oneDay)
    if (gap === 1) streak += 1
    else break
  }
  return streak
}

/**
 * Aggregate raw backend progress records (plus any locally-known completed
 * lessons) into the real numbers the dashboards display. Everything here is
 * derived from actual learner activity — no fabricated trends.
 */
export const aggregateProgress = (records = [], { completedLessons = [] } = {}) => {
  const quizAttempts = []
  const practiceAttempts = []
  let lessonCompletedRecords = 0

  records.forEach((rec) => {
    if (rec?.lessonCompleted) lessonCompletedRecords += 1
    ;(rec?.quizAttempts || []).forEach((a) => quizAttempts.push({ ...a, weekId: rec.weekId }))
    ;(rec?.practiceAttempts || []).forEach((a) => practiceAttempts.push({ ...a, weekId: rec.weekId }))
  })

  // Lessons can be tracked locally (lesson ids) and on the backend (per-week flag);
  // take whichever source knows about more completions so we never under-report.
  const lessonsCompleted = Math.max(completedLessons.length || 0, lessonCompletedRecords)
  const overallProgress = Math.min(Math.round((lessonsCompleted / TOTAL_LESSONS) * 100), 100)

  const quizPercents = quizAttempts.map((a) => a.percentage ?? (a.maxScore ? (a.score / a.maxScore) * 100 : 0))
  const practicePercents = practiceAttempts.map((a) => a.percentage ?? (a.totalQuestions ? (a.score / a.totalQuestions) * 100 : 0))

  const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, n) => s + n, 0) / arr.length) : 0)

  // Recent activity is a unified, date-sorted feed of real attempts.
  const recentActivity = [
    ...quizAttempts.map((a) => ({
      date: a.attemptDate,
      type: 'quiz',
      activity: `Quiz attempt — ${Math.round(a.percentage ?? 0)}%`,
      score: Math.round(a.percentage ?? 0)
    })),
    ...practiceAttempts.map((a) => ({
      date: a.attemptDate,
      type: 'practice',
      activity: `Practice — ${a.score}/${a.totalQuestions} correct`,
      score: Math.round(a.percentage ?? 0)
    }))
  ]
    .filter((a) => a.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)

  // Weekly trend groups real attempts by syllabus week for the line chart.
  const byWeek = new Map()
  quizAttempts.forEach((a) => {
    const key = a.weekId || 0
    if (!byWeek.has(key)) byWeek.set(key, { week: `Week ${key || '–'}`, scores: [], count: 0 })
    byWeek.get(key).scores.push(a.percentage ?? 0)
    byWeek.get(key).count += 1
  })
  const weeklyTrend = Array.from(byWeek.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => ({
      week: v.week,
      quizScore: avg(v.scores),
      attempts: v.count
    }))

  const streak = computeStreak([
    ...quizAttempts.map((a) => a.attemptDate),
    ...practiceAttempts.map((a) => a.attemptDate)
  ])

  return {
    lessonsCompleted,
    totalLessons: TOTAL_LESSONS,
    overallProgress,
    quizCount: quizAttempts.length,
    avgQuizScore: avg(quizPercents),
    bestQuizScore: quizPercents.length ? Math.round(Math.max(...quizPercents)) : 0,
    practiceCount: practiceAttempts.length,
    avgPracticeScore: avg(practicePercents),
    currentStreak: streak,
    recentActivity,
    weeklyTrend,
    quizAttempts,
    practiceAttempts
  }
}

/**
 * Convenience: fetch + aggregate in one call. Falls back to context-only stats
 * (still real, just local) if the backend is unreachable, so pages never break.
 */
export const getLearnerStats = async (userId, context = {}) => {
  const { progress } = await getProgress(userId)
  return aggregateProgress(progress, context)
}
