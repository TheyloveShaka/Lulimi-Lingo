import crypto from 'crypto'
import lessonGeneratorService from '../services/lessonGeneratorService.js'
import quizGeneratorService from '../services/quizGeneratorService.js'
import practiceGeneratorService from '../services/practiceGeneratorService.js'
import { chat as tutorChat, callOpenAIChat } from '../services/aiService.js'
import geminiService from '../services/geminiService.js'
import Conversation from '../models/Conversation.js'
import Progress from '../models/Progress.js'
import GeneratedContent from '../models/GeneratedContent.js'

const normalizeText = (value) => String(value || '').trim().toLowerCase()

const buildRequestKey = (contentType, payload = {}) => {
  const keyPayload = {
    contentType,
    topic: normalizeText(payload.topic),
    classLevel: normalizeText(payload.classLevel),
    term: normalizeText(payload.term),
    week: normalizeText(payload.week),
    language: normalizeText(payload.language),
    numQuestions: Number(payload.numQuestions || 5),
    proficiencyLevel: normalizeText(payload.proficiencyLevel),
    objectives: Array.isArray(payload.objectives) ? payload.objectives.map(normalizeText).sort() : [],
    criteria: Array.isArray(payload.criteria) ? payload.criteria.map(normalizeText).sort() : [],
    commonMistakes: Array.isArray(payload.commonMistakes) ? payload.commonMistakes.map(normalizeText).sort() : [],
    // Nonce ensures cache busting when frontend requests fresh content
    nonce: payload._nonce ? String(payload._nonce) : ''
  }

  return crypto.createHash('sha256').update(JSON.stringify(keyPayload)).digest('hex')
}

const loadFromCache = async (contentType, requestKey) => {
  const cached = await GeneratedContent.findOne({ contentType, requestKey })
  if (!cached) return null

  cached.hitCount += 1
  cached.lastAccessedAt = new Date()
  await cached.save()
  return cached
}

const saveToCache = async ({ contentType, requestKey, requestMeta, content, provider }) => {
  await GeneratedContent.findOneAndUpdate(
    { contentType, requestKey },
    {
      contentType,
      requestKey,
      requestMeta,
      content,
      provider: provider || 'unknown',
      lastAccessedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
}

/**
 * Generate a lesson using AI
 * POST /api/ai/lesson
 */
export const generateLesson = async (req, res) => {
  try {
    const {
      classLevel = req.body.class_level || 'S1',
      term = 'Term 1',
      week = 'Week 1',
      topic,
      objectives = [],
      language = req.body.language || 'luganda',
      proficiencyLevel = req.body.proficiency_level || 'beginner'
    } = req.body

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      })
    }

    const requestMeta = { classLevel, term, week, topic, objectives, language, proficiencyLevel }
    const requestKey = buildRequestKey('lesson', requestMeta)
    const cached = await loadFromCache('lesson', requestKey)

    if (cached) {
      return res.json({
        success: true,
        lesson: cached.content,
        data: cached.content,
        cached: true,
        provider: cached.provider,
        source: 'mongo-cache'
      })
    }

    const lesson = await lessonGeneratorService.generate({
      classLevel,
      term,
      week,
      topic,
      objectives,
      language,
      proficiencyLevel
    })

    await saveToCache({
      contentType: 'lesson',
      requestKey,
      requestMeta,
      content: lesson,
      provider: lesson?.provider || 'openai'
    })

    return res.json({
      success: true,
      lesson,
      data: lesson,
      cached: false,
      provider: lesson?.provider || 'openai'
    })
  } catch (error) {
    console.error('Lesson generation error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * Generate a quiz using AI
 * POST /api/ai/quiz
 */
export const generateQuiz = async (req, res) => {
  try {
    const {
      topic,
      numQuestions = req.body.number_of_questions || 5,
      criteria = req.body.assessment_criteria || [],
      language = req.body.language || 'luganda',
      proficiencyLevel = req.body.proficiency_level || 'beginner'
    } = req.body

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      })
    }

    const requestMeta = { topic, numQuestions, criteria, language, proficiencyLevel }
    const requestKey = buildRequestKey('quiz', requestMeta)
    const cached = await loadFromCache('quiz', requestKey)

    if (cached) {
      return res.json({
        success: true,
        quiz: cached.content,
        data: cached.content,
        cached: true,
        provider: cached.provider,
        source: 'mongo-cache'
      })
    }

    const quiz = await quizGeneratorService.generate({
      topic,
      numQuestions: Math.min(numQuestions, 10), // Cap at 10
      criteria,
      language,
      proficiencyLevel
    })

    await saveToCache({
      contentType: 'quiz',
      requestKey,
      requestMeta,
      content: quiz,
      provider: quiz?.provider || 'openai'
    })

    return res.json({
      success: true,
      quiz,
      data: quiz,
      cached: false,
      provider: quiz?.provider || 'openai'
    })
  } catch (error) {
    console.error('Quiz generation error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * Generate practice questions using AI
 * POST /api/ai/practice
 */
export const generatePractice = async (req, res) => {
  try {
    const {
      topic,
      proficiencyLevel = req.body.proficiency_level || 'beginner',
      commonMistakes = req.body.common_mistakes || [],
      topicObjectives = req.body.topic_objectives || [],
      language = req.body.language || 'luganda'
    } = req.body

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      })
    }

    const requestMeta = { topic, proficiencyLevel, commonMistakes, objectives: topicObjectives, language }
    const requestKey = buildRequestKey('practice', requestMeta)
    const cached = await loadFromCache('practice', requestKey)

    if (cached) {
      return res.json({
        success: true,
        practice: cached.content,
        questions: cached.content?.questions || [],
        data: cached.content,
        cached: true,
        provider: cached.provider,
        source: 'mongo-cache'
      })
    }

    const practice = await practiceGeneratorService.generate({
      topic,
      proficiencyLevel,
      commonMistakes,
      topicObjectives,
      language
    })

    await saveToCache({
      contentType: 'practice',
      requestKey,
      requestMeta,
      content: practice,
      provider: practice?.provider || 'openai'
    })

    return res.json({
      success: true,
      practice,
      questions: practice?.questions || [],
      data: practice,
      cached: false,
      provider: practice?.provider || 'openai'
    })
  } catch (error) {
    console.error('Practice generation error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * Chat with AI Tutor
 * POST /api/ai/chat
 */
export const chatWithTutor = async (req, res) => {
  try {
    const {
      userId,
      message,
      conversationHistory = req.body.conversation_history || []
    } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    // Load user progress for context and keep prompt short
    const progress = userId ? await Progress.findOne({ user: userId }).lean() : null

    // GPT-4o first, Gemini fallback
    const aiResult = await tutorChat(message, { progress, conversationHistory })
    const reply = aiResult.response

    // Persist conversation
    if (userId) {
      try {
        let conv = await Conversation.findOne({ user: userId })
        if (!conv) {
          conv = await Conversation.create({ user: userId, messages: [] })
        }
        conv.messages.push({ role: 'user', content: message })
        conv.messages.push({ role: 'assistant', content: reply })
        conv.updatedAt = new Date()
        await conv.save()
      } catch (error) {
        console.error('Conversation save error:', error.message)
      }
    }

    return res.json({
      success: true,
      response: reply,
      provider: aiResult.provider || 'openai'
    })
  } catch (error) {
    console.error('Chat error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * Generate feedback for learner answers
 * POST /api/feedback
 */
export const generateFeedback = async (req, res) => {
  try {
    const {
      learner_answers: learnerAnswers = {},
      correct_answers: correctAnswers = {},
      topic_objectives: topicObjectives = [],
      language = 'luganda'
    } = req.body || {}

    const languageName = String(language).toLowerCase() === 'runyankole' ? 'Runyankole' : 'Luganda'

    const prompt = `You are a ${languageName} teacher. Review the learner answers and provide a brief, constructive summary.

Learner answers:
${JSON.stringify(learnerAnswers, null, 2)}

Correct answers:
${JSON.stringify(correctAnswers, null, 2)}

Topic objectives:
${JSON.stringify(topicObjectives, null, 2)}

Return a short summary with strengths, weak areas, and a short encouragement. Keep it concise.`

    try {
      const content = await callOpenAIChat([
        { role: 'system', content: `You are a supportive ${languageName} teacher.` },
        { role: 'user', content: prompt }
      ], 380)

      return res.json({
        success: true,
        feedback: {
          summary: content
        }
      })
    } catch (openAiError) {
      if (geminiService.isEnabled()) {
        const content = await geminiService.generateContent(prompt)
        return res.json({
          success: true,
          feedback: {
            summary: content
          },
          provider: 'gemini'
        })
      }

      return res.json({
        success: true,
        feedback: {
          summary: 'Keep practicing! Focus on the corrections shown and revisit the key vocabulary from this topic.'
        }
      })
    }
  } catch (error) {
    console.error('Feedback generation error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
