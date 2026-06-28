import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Brain, Dumbbell, Play } from 'lucide-react'
import { useLearning } from '../../context/LearningContext'
import LessonView from '../learning/LessonView'
import PracticeView from '../learning/PracticeView'
import QuizView from '../learning/QuizView'
import ResultsView from '../learning/ResultsView'
import './WeekModal.css'

const WeekModal = ({ week, onClose }) => {
  const [activeTab, setActiveTab] = useState('lecture')
  const [isLearningMode, setIsLearningMode] = useState(false)
  const [showTopics, setShowTopics] = useState(false)
  const [resultsData, setResultsData] = useState(null)
  const { completedLessons, quizScores, setCurrentWeek, setCurrentTopic, getWeekProgress } = useLearning()

  const tabs = [
    { id: 'lecture', label: 'Lecture', icon: <BookOpen size={18} /> },
    { id: 'practice', label: 'Practice', icon: <Dumbbell size={18} /> },
    { id: 'quiz', label: 'Quiz', icon: <Brain size={18} /> },
    { id: 'results', label: 'Results', icon: <Play size={18} /> },
  ]

  // Check completion status. These ids are the single contract between the modal,
  // the learning views (which write them), and the ladder (which reads them).
  const lessonId = `week-${week.id}-lesson`
  const quizId = `week-${week.id}-quiz`
  const practiceId = `week-${week.id}-practice`
  const isLessonComplete = completedLessons.includes(lessonId)
  const isQuizComplete = quizScores[quizId] !== undefined
  const weekProgress = getWeekProgress(week.id)

  // Start learning mode
  const startLearning = (mode) => {
    setCurrentWeek(week.id)
    setCurrentTopic(week.topics[0])
    setActiveTab(mode)
    setShowTopics(false)
    setIsLearningMode(true)
  }

  // Exit learning mode
  const exitLearningMode = () => {
    setIsLearningMode(false)
    setActiveTab('lecture')
    setShowTopics(false)
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
  const handleQuizComplete = () => {
    // When QuizView calls onComplete(results, feedback) we switch to the results tab.
    setActiveTab('results')
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
                <div className="week-meta-row">
                  <span className="week-number">{week.id}</span>
                  {Array.isArray(week.topics) && week.topics.length > 0 && (
                    <button
                      type="button"
                      className="topics-toggle-btn"
                      onClick={() => setShowTopics((prev) => !prev)}
                      aria-expanded={showTopics}
                    >
                      {showTopics ? 'Hide topics' : 'Topics'}
                      <span className={`topics-toggle-icon ${showTopics ? 'open' : ''}`}>▾</span>
                    </button>
                  )}
                </div>
                <h2>{week.title}</h2>
                {showTopics && (
                  <div className="topics-list">
                    {week.topics.map((topic, index) => (
                      <span key={index} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                )}
              </div>
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="week-progress">
              <div className="progress-info">
                <span>Week Progress</span>
                <span className="progress-percentage">{weekProgress}%</span>
              </div>
              <div className="progress-bar-modal">
                <motion.div
                  className="progress-fill-modal"
                  initial={{ width: 0 }}
                  animate={{ width: `${weekProgress}%` }}
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
                onClick={() => {
                  setActiveTab(tab.id)
                  setShowTopics(false)
                }}
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
              {activeTab === 'lecture' && (
                isLearningMode ? (
                  <LessonView
                    topic={{
                      id: lessonId,
                      title: week.title,
                      topics: week.topics,
                      weekId: week.id,
                      objectives: week.topics
                    }}
                    onComplete={handleLessonComplete}
                    onStartPractice={() => startLearning('practice')}
                  />
                ) : (
                  <LecturePreview onStart={() => startLearning('lecture')} isComplete={isLessonComplete} week={week} />
                )
              )}
              {activeTab === 'quiz' && (
                isLearningMode ? (
                  <QuizView
                    topic={{
                      id: quizId,
                      title: week.title,
                      topics: week.topics,
                      weekId: week.id
                    }}
                    onComplete={(results, feedback) => {
                      setResultsData({ results, feedback })
                      handleQuizComplete()
                    }}
                    numberOfQuestions={5}
                  />
                ) : (
                  <QuizPreview onStart={() => startLearning('quiz')} isComplete={isQuizComplete} score={quizScores[quizId]} week={week} />
                )
              )}
              {activeTab === 'practice' && (
                isLearningMode ? (
                  <PracticeView
                    topic={{
                      id: practiceId,
                      title: week.title,
                      topics: week.topics,
                      weekId: week.id
                    }}
                    onComplete={handlePracticeComplete}
                    onStartQuiz={() => startLearning('quiz')}
                  />
                ) : (
                  <PracticePreview onStart={() => startLearning('practice')} week={week} />
                )
              )}
              {activeTab === 'results' && (
                isLearningMode ? (
                  <ResultsView
                    topic={week.title}
                    resultsData={resultsData}
                    onDone={exitLearningMode}
                  />
                ) : (
                  <div className="tab-content">
                    <p>Start the quiz to see results.</p>
                  </div>
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

// Renders this week's actual topics so each level's preview is distinct.
const TopicChecklist = ({ week }) => (
  Array.isArray(week?.topics) && week.topics.length > 0 ? (
    <div className="preview-topics">
      <span className="preview-topics-label">What you'll cover</span>
      <ul>
        {week.topics.map((topic, i) => (
          <li key={i}>{topic}</li>
        ))}
      </ul>
    </div>
  ) : null
)

// Lecture Preview (before starting)
const LecturePreview = ({ onStart, isComplete, week }) => (
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
      <h3>{week?.title || 'Lecture Content'}</h3>
      <p>AI-generated lessons tailored to your learning style</p>
      <TopicChecklist week={week} />
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
const QuizPreview = ({ onStart, isComplete, score, week }) => (
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
      <h3>Quiz — {week?.title || 'Assessment'}</h3>
      {isComplete && score ? (
        <div className="previous-score">
          <p>Your last score: <strong>{score.percentage}%</strong></p>
          <p>{score.score}/{score.maxScore} correct</p>
        </div>
      ) : (
        <p>AI-generated questions on this week's topics</p>
      )}
      <TopicChecklist week={week} />
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
const PracticePreview = ({ onStart, week }) => (
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
      <h3>Practice — {week?.title || 'Activities'}</h3>
      <p>Interactive exercises to reinforce this week's topics</p>
      <TopicChecklist week={week} />
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
