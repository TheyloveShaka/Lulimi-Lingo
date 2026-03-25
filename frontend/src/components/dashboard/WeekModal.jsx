import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Brain, Dumbbell, Play, CheckCircle, Lock, ArrowLeft } from 'lucide-react'
import { useLearning } from '../../context/LearningContext'
import LessonView from '../learning/LessonView'
import PracticeView from '../learning/PracticeView'
import QuizView from '../learning/QuizView'
import './WeekModal.css'

const WeekModal = ({ week, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLearningMode, setIsLearningMode] = useState(false)
  const { completedLessons, quizScores, setCurrentWeek, setCurrentTopic } = useLearning()

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen size={18} /> },
    { id: 'lecture', label: 'Lecture', icon: <BookOpen size={18} /> },
    { id: 'quiz', label: 'Quiz', icon: <Brain size={18} /> },
    { id: 'practice', label: 'Practice', icon: <Dumbbell size={18} /> },
  ]

  // Check completion status
  const lessonId = `week-${week.id}-lesson`
  const quizId = `week-${week.id}-quiz`
  const isLessonComplete = completedLessons.includes(lessonId)
  const isQuizComplete = quizScores[quizId] !== undefined

  // Start learning mode
  const startLearning = (mode) => {
    setCurrentWeek(week.id)
    setCurrentTopic(week.topics[0])
    setActiveTab(mode)
    setIsLearningMode(true)
  }

  // Exit learning mode
  const exitLearningMode = () => {
    setIsLearningMode(false)
    setActiveTab('overview')
  }

  // Exit fullscreen on Escape key
  useEffect(() => {
    if (!isLearningMode) return;
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        exitLearningMode()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isLearningMode])

  // Handle lesson completion
  const handleLessonComplete = () => {
    exitLearningMode()
  }

  // Handle quiz completion
  const handleQuizComplete = (score, total) => {
    exitLearningMode()
  }

  // Handle practice completion
  const handlePracticeComplete = () => {
    exitLearningMode()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isLearningMode ? undefined : onClose}
      >
        <motion.div
          className={`week-modal ${isLearningMode ? 'fullscreen' : ''}`}
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
                <span className="week-number">{week.id}</span>
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
              {activeTab === 'overview' && <OverviewTab week={week} onStartLearning={startLearning} isLessonComplete={isLessonComplete} isQuizComplete={isQuizComplete} />}
              {activeTab === 'lecture' && (
                isLearningMode ? (
                  <LessonView 
                    topic={{
                      title: week.title,
                      topics: week.topics,
                      weekId: week.id,
                      objectives: week.topics
                    }}
                    onComplete={handleLessonComplete}
                    onStartPractice={() => startLearning('practice')}
                  />
                ) : (
                  <LecturePreview onStart={() => startLearning('lecture')} isComplete={isLessonComplete} />
                )
              )}
              {activeTab === 'quiz' && (
                isLearningMode ? (
                  <QuizView 
                    topic={{
                      title: week.title,
                      topics: week.topics,
                      weekId: week.id
                    }}
                    onComplete={handleQuizComplete}
                    numberOfQuestions={5}
                  />
                ) : (
                  <QuizPreview onStart={() => startLearning('quiz')} isComplete={isQuizComplete} score={quizScores[quizId]} />
                )
              )}
              {activeTab === 'practice' && (
                isLearningMode ? (
                  <PracticeView 
                    topic={{
                      title: week.title,
                      topics: week.topics,
                      weekId: week.id
                    }}
                    onComplete={handlePracticeComplete}
                    onStartQuiz={() => startLearning('quiz')}
                  />
                ) : (
                  <PracticePreview onStart={() => startLearning('practice')} />
                )
              )}
            </AnimatePresence>
          </div>
          {isLearningMode && (
            <button className="fullscreen-exit" onClick={exitLearningMode} title="Exit full view">← Exit</button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Overview Tab
const OverviewTab = ({ week, onStartLearning, isLessonComplete, isQuizComplete }) => (
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
        <div className="section-card" onClick={() => onStartLearning('lecture')}>
          <div className="section-icon lecture">
            <BookOpen size={32} />
          </div>
          <h4>Lecture</h4>
          <p>Interactive lessons with AI-powered content</p>
          {isLessonComplete ? (
            <span className="status-badge completed">✓ Completed</span>
          ) : (
            <motion.button 
              className="start-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={16} /> Start Lesson
            </motion.button>
          )}
        </div>

        <div className="section-card" onClick={() => onStartLearning('quiz')}>
          <div className="section-icon quiz">
            <Brain size={32} />
          </div>
          <h4>Quiz</h4>
          <p>Test your knowledge with adaptive questions</p>
          {isQuizComplete ? (
            <span className="status-badge completed">✓ Completed</span>
          ) : (
            <motion.button 
              className="start-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={16} /> Take Quiz
            </motion.button>
          )}
        </div>

        <div className="section-card" onClick={() => onStartLearning('practice')}>
          <div className="section-icon practice">
            <Dumbbell size={32} />
          </div>
          <h4>Practice</h4>
          <p>Reinforce learning with interactive exercises</p>
          <motion.button 
            className="start-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={16} /> Practice Now
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
)

// Lecture Preview (before starting)
const LecturePreview = ({ onStart, isComplete }) => (
  <motion.div
    key="lecture-preview"
    className="tab-content"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="preview-content">
      <div className="preview-icon">
        <BookOpen size={64} />
      </div>
      <h3>Lecture Content</h3>
      <p>AI-generated lessons tailored to your learning style</p>
      <div className="preview-features">
        <div className="feature-item">✨ Interactive language explanations</div>
        <div className="feature-item">✨ Cultural context and usage notes</div>
        <div className="feature-item">✨ Vocabulary with examples</div>
        <div className="feature-item">✨ Progress tracking</div>
      </div>
      <motion.button 
        className="start-learning-btn"
        onClick={onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isComplete ? 'Review Lesson' : 'Start Lesson'} <Play size={20} />
      </motion.button>
    </div>
  </motion.div>
)

// Quiz Preview (before starting)
const QuizPreview = ({ onStart, isComplete, score }) => (
  <motion.div
    key="quiz-preview"
    className="tab-content"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="preview-content">
      <div className="preview-icon">
        <Brain size={64} />
      </div>
      <h3>Quiz Section</h3>
      {isComplete && score ? (
        <div className="previous-score">
          <p>Your last score: <strong>{score.percentage}%</strong></p>
          <p>{score.score}/{score.maxScore} correct</p>
        </div>
      ) : (
        <p>AI-generated quizzes to test your knowledge</p>
      )}
      <div className="preview-features">
        <div className="feature-item">✨ Multiple question types</div>
        <div className="feature-item">✨ Instant feedback</div>
        <div className="feature-item">✨ Adaptive difficulty</div>
        <div className="feature-item">✨ Performance tracking</div>
      </div>
      <motion.button 
        className="start-learning-btn"
        onClick={onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isComplete ? 'Retake Quiz' : 'Start Quiz'} <Play size={20} />
      </motion.button>
    </div>
  </motion.div>
)

// Practice Preview (before starting)
const PracticePreview = ({ onStart }) => (
  <motion.div
    key="practice-preview"
    className="tab-content"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="preview-content">
      <div className="preview-icon">
        <Dumbbell size={64} />
      </div>
      <h3>Practice Activities</h3>
      <p>Interactive exercises to reinforce your learning</p>
      <div className="preview-features">
        <div className="feature-item">✨ Fill in the blank exercises</div>
        <div className="feature-item">✨ Translation practice</div>
        <div className="feature-item">✨ Word reordering</div>
        <div className="feature-item">✨ Multiple choice questions</div>
      </div>
      <motion.button 
        className="start-learning-btn"
        onClick={onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Start Practice <Play size={20} />
      </motion.button>
    </div>
  </motion.div>
)

export default WeekModal
