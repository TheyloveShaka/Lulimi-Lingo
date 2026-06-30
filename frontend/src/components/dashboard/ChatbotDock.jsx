import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Minimize2, Send, Sparkles, Loader2 } from 'lucide-react'
import { useLearning } from '../../context/LearningContext'
import { chatWithTutor } from '../../services/aiService'
import { getLearnerStats } from '../../services/progressService'
import './ChatbotDock.css'

const ChatbotDock = ({ isOpen, onToggle, completedTopics }) => {
  const { getCompletedTopicsForAI, language, proficiencyLevel, completedLessons, commonMistakes } = useLearning()
  const [liveStats, setLiveStats] = useState(null)

  // The tutor greeting/fallback must match the learner's chosen language, otherwise
  // a Runyankole account would still be greeted in Luganda. Pick the labels from
  // the active language rather than hardcoding Luganda.
  const isRunyankole = String(language || '').toLowerCase() === 'runyankole'
  const languageLabel = isRunyankole ? 'Runyankole' : 'Luganda'
  const greeting = isRunyankole ? 'Agandi' : 'Oli otya'

  // Load the learner's real progress once so the tutor is grounded in actual activity.
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('lulimiLingoCurrentUser') || 'null')
    if (!currentUser?._id) return
    getLearnerStats(currentUser._id, {
      completedLessons: completedLessons?.length ? completedLessons : (currentUser.completedLessons || [])
    }).then(setLiveStats).catch(() => {})
  }, [completedLessons])

  // Summarize the learner's real performance so the tutor can adapt its level
  // and reference weak spots without us sending the full progress object.
  const buildProgressSummary = () => {
    const parts = []
    if (liveStats) {
      parts.push(`Lessons completed: ${liveStats.lessonsCompleted}/${liveStats.totalLessons}`)
      if (liveStats.quizCount > 0) {
        parts.push(`Average quiz score: ${liveStats.avgQuizScore}% (best ${liveStats.bestQuizScore}%, ${liveStats.quizCount} taken)`)
      }
      if (liveStats.practiceCount > 0) {
        parts.push(`Practice sessions completed: ${liveStats.practiceCount}`)
      }
      if (liveStats.currentStreak > 0) {
        parts.push(`Current daily streak: ${liveStats.currentStreak}`)
      }
    }
    if (Array.isArray(commonMistakes) && commonMistakes.length) {
      const topMistakes = commonMistakes
        .slice()
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 3)
        .map((m) => m.type)
        .filter(Boolean)
      if (topMistakes.length) parts.push(`Recurring difficulty with: ${topMistakes.join(', ')}`)
    }
    return parts.join('. ')
  }
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `${greeting}! 👋 I'm your ${languageLabel} learning assistant. I can help you understand lessons, practice vocabulary, or answer questions about what you've learned. How can I help you today?`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    // Store the user's message locally before asking the AI tutor.
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    }

    const currentInput = inputValue
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Send completed topics so the tutor stays inside the learner's current scope.
      const topicsForAI = getCompletedTopicsForAI && getCompletedTopicsForAI()
      const contexts = topicsForAI || completedTopics || ['Basic Greetings']

      console.log('Sending message to tutor:', {
        message: currentInput,
        completedTopics: contexts,
        conversationHistory: messages.length
      })

      // The backend returns the tutor reply and any encouragement message.
      // We forward the learner's language, level, and a progress summary so the
      // tutor stays aware of their proficiency.
      const response = await chatWithTutor({
        message: currentInput,
        completedTopics: contexts,
        language,
        proficiencyLevel,
        progressSummary: buildProgressSummary(),
        conversationHistory: messages.map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      })

      console.log('Tutor response:', response)

      if (!response.success) {
        throw new Error(response.error || 'Failed to get response')
      }

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response.response || `I'm here to help you learn ${languageLabel}!`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])

      // Encourage the learner with a second message when the tutor returns one.
      if (response.encouragement) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            type: 'bot',
            text: response.encouragement,
            timestamp: new Date(),
            isEncouragement: true
          }])
        }, 1000)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { label: 'Explain greetings', icon: '💡' },
    { label: 'How do I say "thank you"?', icon: '🙏' },
    { label: 'Practice vocabulary', icon: '📝' },
    { label: 'Cultural tips', icon: '🇺🇬' },
  ]

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="chatbot-fab"
            onClick={onToggle}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MessageCircle size={28} />
            <motion.div
              className="fab-pulse"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* The panel is the learner-facing AI tutor drawer. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-title">
                <div className="bot-avatar">
                  <Sparkles size={20} />
                </div>
                <div className="bot-info">
                  <h3>AI Tutor</h3>
                  <span className="bot-status">
                    <span className="status-dot"></span>
                    {isTyping ? 'Typing...' : 'Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* Message history keeps the conversation context visible. */}
            <div className="chatbot-messages">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.type} ${message.isEncouragement ? 'encouragement' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.type === 'bot' && (
                    <div className="message-avatar">
                      <Sparkles size={16} />
                    </div>
                  )}
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  className="message bot typing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="message-avatar">
                    <Sparkles size={16} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions help beginners ask useful questions fast. */}
            {messages.length === 1 && (
              <div className="quick-actions">
                <p className="quick-actions-label">Quick actions:</p>
                <div className="action-buttons">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      className="action-btn"
                      onClick={() => setInputValue(action.label)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="action-icon">{action.icon}</span>
                      <span>{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* The input sends the learner's question to the tutor. */}
            <div className="chatbot-input">
              <motion.button
                className="collapse-btn"
                onClick={onToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Collapse chat"
              >
                <Minimize2 size={18} />
              </motion.button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                rows="1"
                disabled={isTyping}
              />
              <motion.button
                className="send-btn"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isTyping ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatbotDock
