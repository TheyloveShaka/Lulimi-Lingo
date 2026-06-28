import React, { useState } from 'react'
import { ChevronDown, Mail, Phone, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './HelpPage.css'

const HelpPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      id: 1,
      question: 'How do I start a lesson?',
      answer: 'Click on the Classes tab in the sidebar, select a week, and click "Start Lesson" on any available lesson. Lessons must be completed in order.'
    },
    {
      id: 2,
      question: 'How are quizzes scored?',
      answer: 'Quizzes are automatically scored based on your answers. Each question may have different point values. Your best score is recorded for each quiz.'
    },
    {
      id: 3,
      question: 'What is a learning streak?',
      answer: 'A learning streak tracks consecutive days you complete at least one lesson or quiz. Maintain your streak to earn achievements!'
    },
    {
      id: 4,
      question: 'Can I retake a quiz?',
      answer: 'Yes! You can retake any quiz to improve your score. Your best score will be recorded.'
    },
    {
      id: 5,
      question: 'How do achievements work?',
      answer: 'Achievements are badges earned by reaching milestones like completing lessons, maintaining streaks, or scoring high on quizzes.'
    },
    {
      id: 6,
      question: 'Where can I download resources?',
      answer: 'Go to the Resources tab to see materials uploaded by your teachers. Click Download to save PDF and document files.'
    }
  ]

  return (
    <div className="help-page">
      <div className="help-header">
        <h1>Help & Support</h1>
        <p>Get answers to your questions</p>
      </div>

      {/* FAQs answer the common questions before the learner has to ask for support. */}
      <motion.div
        className="faq-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Frequently Asked Questions</h2>

        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.id}
              className="faq-item"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <button
                className={`faq-question ${expandedFaq === faq.id ? 'active' : ''}`}
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                <span>{faq.question}</span>
                <ChevronDown size={20} />
              </button>

              <AnimatePresence>
                {expandedFaq === faq.id && (
                  <motion.div
                    className="faq-answer"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact cards show the support channels and location in one place. */}
      <motion.div
        className="contact-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Contact Us</h2>

        <div className="contact-grid">
          <div className="contact-card">
            <Mail size={32} />
            <h3>Email</h3>
            <p>support@lulimilingo.com</p>
          </div>

          <div className="contact-card">
            <Phone size={32} />
            <h3>Phone</h3>
            <p>+256 (0) 123 456 789</p>
          </div>

          <div className="contact-card">
            <MapPin size={32} />
            <h3>Location</h3>
            <p>Kampala, Uganda</p>
          </div>
        </div>
      </motion.div>

      {/* The tips section turns the help page into a mini learning guide too. */}
      <motion.div
        className="tips-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2>Learning Tips</h2>

        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-number">1</span>
            <h3>Learn Consistently</h3>
            <p>Spend 15-30 minutes daily on lessons for best results. A daily habit makes learning stick!</p>
          </div>

          <div className="tip-card">
            <span className="tip-number">2</span>
            <h3>Practice Speaking</h3>
            <p>Use the pronunciation guides and practice speaking aloud. This improves fluency faster.</p>
          </div>

          <div className="tip-card">
            <span className="tip-number">3</span>
            <h3>Review Vocabulary</h3>
            <p>Visit your vocabulary bank regularly to reinforce words you've learned.</p>
          </div>

          <div className="tip-card">
            <span className="tip-number">4</span>
            <h3>Take Quizzes</h3>
            <p>Test yourself with quizzes to identify weak areas and track progress.</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HelpPage
