import Progress from '../models/Progress.js'
import User from '../models/User.js'

export const getProgress = async (req, res) => {
  const { userId } = req.params
  try {
    const progress = await Progress.find({ user: userId }).lean()
    return res.json({ success: true, progress })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: err.message })
  }
}

export const upsertProgress = async (req, res) => {
  const { userId } = req.params
  const payload = req.body || {}
  try {
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    const language = payload.language || user.language || 'luganda'
    const proficiencyLevel = payload.proficiencyLevel || user.proficiencyLevel || 'beginner'
    const filter = { user: userId, weekId: payload.weekId, language }

    let doc = await Progress.findOne(filter)
    if (!doc) {
      doc = new Progress({
        user: userId,
        weekId: payload.weekId,
        language,
        proficiencyLevel
      })
    }

    if (payload.lessonCompleted !== undefined) doc.lessonCompleted = payload.lessonCompleted
    if (payload.lessonId) doc.lessonId = payload.lessonId
    if (payload.quizScores) doc.quizScores = payload.quizScores
    if (payload.practiceData) doc.practiceData = payload.practiceData
    doc.language = language
    doc.proficiencyLevel = proficiencyLevel

    if (payload.quizAttempt) {
      const attempt = {
        ...payload.quizAttempt,
        attemptDate: payload.quizAttempt.attemptDate ? new Date(payload.quizAttempt.attemptDate) : new Date()
      }
      doc.quizAttempts = [...(doc.quizAttempts || []), attempt]
    }

    if (payload.practiceAttempt) {
      const attempt = {
        ...payload.practiceAttempt,
        attemptDate: payload.practiceAttempt.attemptDate ? new Date(payload.practiceAttempt.attemptDate) : new Date()
      }
      doc.practiceAttempts = [...(doc.practiceAttempts || []), attempt]
    }

    const quizAttempts = doc.quizAttempts || []
    const totalScore = quizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0)
    const averageScore = quizAttempts.length
      ? Math.round(quizAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / quizAttempts.length)
      : 0

    doc.totalScore = totalScore
    doc.averageScore = averageScore
    doc.completionPercentage = payload.completionPercentage ?? doc.completionPercentage ?? 0
    doc.updatedAt = new Date()

    await doc.save()
    return res.json({ success: true, progress: doc })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: err.message })
  }
}
