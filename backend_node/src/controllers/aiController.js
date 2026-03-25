import lessonGeneratorService from '../services/lessonGeneratorService.js'
import quizGeneratorService from '../services/quizGeneratorService.js'
import practiceGeneratorService from '../services/practiceGeneratorService.js'
import geminiService from '../services/geminiService.js'
import Conversation from '../models/Conversation.js'
import Progress from '../models/Progress.js'
import User from '../models/User.js'

/**
 * Generate a lesson using AI
 * POST /api/ai/lesson
 */
export const generateLesson = async (req, res) => {
  try {
    const {
      classLevel = 'S1',
      term = 'Term 1',
      week = 'Week 1',
      topic,
      objectives = []
    } = req.body

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      })
    }

    const lesson = await lessonGeneratorService.generate({
      classLevel,
      term,
      week,
      topic,
      objectives
    })

    return res.json({
      success: true,
      data: lesson
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
      numQuestions = 5,
      criteria = []
    } = req.body

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      })
    }

    const quiz = await quizGeneratorService.generate({
      topic,
      numQuestions: Math.min(numQuestions, 10), // Cap at 10
      criteria
    })

    return res.json({
      success: true,
      data: quiz
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
      proficiencyLevel = 'beginner',
      commonMistakes = []
    } = req.body

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      })
    }

    const practice = await practiceGeneratorService.generate({
      topic,
      proficiencyLevel,
      commonMistakes
    })

    return res.json({
      success: true,
      data: practice
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
      conversationHistory = []
    } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    // Load user progress for context
    const progress = userId ? await Progress.findOne({ user: userId }).lean() : null

    // Call AI service
    const reply = await geminiService.chat(message, conversationHistory)

    // Persist conversation
    if (userId) {
      try {
        let conv = await Conversation.findOne({ user: userId })
        if (!conv) {
          conv = await Conversation.create({ user: userId, messages: [] })
        }
        conv.messages.push({ role: 'user', content: message, timestamp: new Date() })
        conv.messages.push({ role: 'assistant', content: reply, timestamp: new Date() })
        conv.updatedAt = new Date()
        await conv.save()
      } catch (error) {
        console.error('Conversation save error:', error.message)
      }
    }

    return res.json({
      success: true,
      response: reply
    })
  } catch (error) {
    console.error('Chat error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
