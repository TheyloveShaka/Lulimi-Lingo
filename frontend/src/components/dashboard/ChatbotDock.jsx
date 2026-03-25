import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react'
import { useLearning } from '../../context/LearningContext'
import { chatWithTutor } from '../../services/aiService'
import './ChatbotDock.css'

const ChatbotDock = ({ isOpen, onToggle, completedTopics }) => {
  const { getCompletedTopicsForAI } = useLearning()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Oli otya! 👋 I'm your Luganda learning assistant. I can help you understand lessons, practice vocabulary, or answer questions about what you've learned. How can I help you today?",
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

    // Add user message
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
      // Get real completed topics from context
      const topicsForAI = getCompletedTopicsForAI && getCompletedTopicsForAI()
      const contexts = topicsForAI || completedTopics || ['Basic Greetings']

      console.log('Sending message to tutor:', {
        message: currentInput,
        completedTopics: contexts,
        conversationHistory: messages.length
      })

      // Call AI tutor
      const response = await chatWithTutor({
        message: currentInput,
        completedTopics: contexts,
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
        text: response.response || "I'm here to help you learn Luganda!",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])

      // Add encouragement as separate message occasionally
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

      {/* Chat Panel */}
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
              <motion.button
                className="header-btn back-btn"
                onClick={onToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Close chat"
              >
                <ArrowLeft size={20} />
              </motion.button>
            </div>

            {/* Messages */}
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

            {/* Quick Actions */}
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

            {/* Input */}
            <div className="chatbot-input">
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
