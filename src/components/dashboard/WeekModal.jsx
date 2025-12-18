import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Brain, Dumbbell, Play, CheckCircle, Lock } from 'lucide-react'
import './WeekModal.css'

const WeekModal = ({ week, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen size={18} /> },
    { id: 'lecture', label: 'Lecture', icon: <BookOpen size={18} /> },
    { id: 'quiz', label: 'Quiz', icon: <Brain size={18} /> },
    { id: 'practice', label: 'Practice', icon: <Dumbbell size={18} /> },
  ]

  // Calculate week progress
  const calculateProgress = () => {
    const lectureComplete = false // Placeholder
    const quizComplete = false // Placeholder
    const practiceComplete = false // Placeholder
    const total = 3
    const completed = [lectureComplete, quizComplete, practiceComplete].filter(Boolean).length
    return Math.round((completed / total) * 100)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="week-modal"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="header-content">
              <div className="week-info">
                <span className="week-number">Week {week.id}</span>
                <h2>{week.title}</h2>
                <div className="topics-list">
                  {week.topics.map((topic, index) => (
                    <span key={index} className="topic-tag">{topic}</span>
                  ))}
                </div>
              </div>
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="week-progress">
              <div className="progress-info">
                <span>Week Progress</span>
                <span className="progress-percentage">{week.progress}%</span>
              </div>
              <div className="progress-bar-modal">
                <motion.div
                  className="progress-fill-modal"
                  initial={{ width: 0 }}
                  animate={{ width: `${week.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="modal-tabs">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <div className="modal-content">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && <OverviewTab week={week} />}
              {activeTab === 'lecture' && <LectureTab />}
              {activeTab === 'quiz' && <QuizTab />}
              {activeTab === 'practice' && <PracticeTab />}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Overview Tab
const OverviewTab = ({ week }) => (
  <motion.div
    key="overview"
    className="tab-content"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <h3>What You'll Learn</h3>
    <div className="learning-objectives">
      {week.topics.map((topic, index) => (
        <div key={index} className="objective-card">
          <CheckCircle size={20} />
          <span>{topic}</span>
        </div>
      ))}
    </div>

    <div className="sections-overview">
      <h3>Learning Sections</h3>
      <div className="section-cards">
        <div className="section-card">
          <div className="section-icon lecture">
            <BookOpen size={32} />
          </div>
          <h4>Lecture</h4>
          <p>Interactive lessons with AI-powered content</p>
          <span className="status-badge placeholder">Coming Soon</span>
        </div>

        <div className="section-card">
          <div className="section-icon quiz">
            <Brain size={32} />
          </div>
          <h4>Quiz</h4>
          <p>Test your knowledge with adaptive questions</p>
          <span className="status-badge placeholder">Coming Soon</span>
        </div>

        <div className="section-card">
          <div className="section-icon practice">
            <Dumbbell size={32} />
          </div>
          <h4>Practice</h4>
          <p>Reinforce learning with interactive exercises</p>
          <span className="status-badge placeholder">Coming Soon</span>
        </div>
      </div>
    </div>
  </motion.div>
)

// Lecture Tab
const LectureTab = () => (
  <motion.div
    key="lecture"
    className="tab-content"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="placeholder-content">
      <div className="placeholder-icon">
        <BookOpen size={64} />
      </div>
      <h3>Lecture Content</h3>
      <p>AI-generated lessons will appear here</p>
      <div className="placeholder-features">
        <div className="feature-item">✨ Interactive explanations</div>
        <div className="feature-item">✨ Audio pronunciations</div>
        <div className="feature-item">✨ Visual aids</div>
        <div className="feature-item">✨ Progress tracking</div>
      </div>
    </div>
  </motion.div>
)

// Quiz Tab
const QuizTab = () => (
  <motion.div
    key="quiz"
    className="tab-content"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="placeholder-content">
      <div className="placeholder-icon">
        <Brain size={64} />
      </div>
      <h3>Quiz Section</h3>
      <p>AI-generated quizzes will appear here</p>
      <div className="placeholder-features">
        <div className="feature-item">✨ Adaptive difficulty</div>
        <div className="feature-item">✨ Multiple question types</div>
        <div className="feature-item">✨ Instant feedback</div>
        <div className="feature-item">✨ Performance analytics</div>
      </div>
    </div>
  </motion.div>
)

// Practice Tab
const PracticeTab = () => (
  <motion.div
    key="practice"
    className="tab-content"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="placeholder-content">
      <div className="placeholder-icon">
        <Dumbbell size={64} />
      </div>
      <h3>Practice Activities</h3>
      <p>Interactive exercises will appear here</p>
      <div className="placeholder-features">
        <div className="feature-item">✨ Speaking practice</div>
        <div className="feature-item">✨ Writing exercises</div>
        <div className="feature-item">✨ Listening comprehension</div>
        <div className="feature-item">✨ Gamified challenges</div>
      </div>
    </div>
  </motion.div>
)

export default WeekModal
