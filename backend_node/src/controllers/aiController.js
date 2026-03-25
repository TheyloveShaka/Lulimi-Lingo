import { generateLesson as aiGenerateLesson, translate as aiTranslate, chat as aiChat } from '../services/aiService.js'
import { generateContent } from '../services/contentGeneratorService.js'
import Conversation from '../models/Conversation.js'
import Progress from '../models/Progress.js'
import User from '../models/User.js'

export const generateLesson = async (req, res) => {
  const payload = req.body || {}
  
  // Try curriculum-based generation if all fields provided
  if (payload.classLevel && payload.term && payload.milestoneId && payload.topic) {
    try {
      const result = await generateContent('lesson', payload.classLevel, payload.term, payload.milestoneId, payload.topic, payload.options || {})
      if (result.success) return res.json(result)
    } catch (err) {
      console.error('Curriculum content generation error:', err.message)
    }
  }

  // Try internal AI
  try {
    const aiResp = await aiGenerateLesson(payload)
    if (aiResp && aiResp.success) return res.json(aiResp)
  } catch (err) {
    console.error('AI lesson error:', err.message)
  }

  // Fallback to proxy to Python backend if configured
  const PY_BACKEND = process.env.PYTHON_BACKEND_URL
  if (PY_BACKEND) {
    try {
      const r = await fetch(`${PY_BACKEND}/api/lesson`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (r.ok) return res.json(await r.json())
    } catch (e) { console.error('Proxy lesson error', e.message) }
  }

  return res.json({ success: true, lesson: { title: payload.topic || 'Mock Lesson', introduction: 'Lesson content unavailable — configure AI backend.' } })
}

export const generatePractice = async (req, res) => {
  const payload = req.body || {}
  
  // Try curriculum-based generation if all fields provided
  if (payload.classLevel && payload.term && payload.milestoneId && payload.topic) {
    try {
      const result = await generateContent('practice', payload.classLevel, payload.term, payload.milestoneId, payload.topic, payload.options || {})
      if (result.success) return res.json(result)
    } catch (err) {
      console.error('Curriculum practice generation error:', err.message)
    }
  }

  // Fallback
  const PY_BACKEND = process.env.PYTHON_BACKEND_URL
  if (PY_BACKEND) {
    try {
      const r = await fetch(`${PY_BACKEND}/api/practice`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (r.ok) return res.json(await r.json())
    } catch (e) { console.error('Proxy practice error', e.message) }
  }
  return res.json({ success: true, questions: [] })
}

export const generateQuiz = async (req, res) => {
  const payload = req.body || {}
  
  // Try curriculum-based generation if all fields provided
  if (payload.classLevel && payload.term && payload.milestoneId && payload.topic) {
    try {
      const result = await generateContent('quiz', payload.classLevel, payload.term, payload.milestoneId, payload.topic, payload.options || {})
      if (result.success) return res.json(result)
    } catch (err) {
      console.error('Curriculum quiz generation error:', err.message)
    }
  }

  // Fallback
  const PY_BACKEND = process.env.PYTHON_BACKEND_URL
  if (PY_BACKEND) {
    try {
      const r = await fetch(`${PY_BACKEND}/api/quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (r.ok) return res.json(await r.json())
    } catch (e) { console.error('Proxy quiz error', e.message) }
  }
  return res.json({ success: true, quiz: { questions: [] } })
}

export const chatWithTutor = async (req, res) => {
  const payload = req.body || {}
  const { userId, message, conversationHistory = [] } = payload
  try {
    // Load user progress for context
    const progress = userId ? await Progress.findOne({ user: userId }).lean() : null

    // Call AI service
    const aiResp = await aiChat(message, { progress, conversationHistory })
    const reply = (aiResp && aiResp.response) || '(no response)'

    // Persist conversation
    try {
      if (userId) {
        let conv = await Conversation.findOne({ user: userId })
        if (!conv) conv = await Conversation.create({ user: userId, messages: [] })
        conv.messages.push({ role: 'user', content: message })
        conv.messages.push({ role: 'assistant', content: reply })
        conv.updatedAt = new Date()
        await conv.save()
      }
    } catch (e) { console.error('Conversation save error', e.message) }

    return res.json({ success: true, response: reply })
  } catch (err) {
    console.error('Chat error:', err.message)
    return res.json({ success: false, response: '(error) Tutor unavailable' })
  }
}
