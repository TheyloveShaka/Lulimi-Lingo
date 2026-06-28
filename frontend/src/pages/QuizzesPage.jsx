import React, { useState, useEffect, useMemo } from 'react'
import { Brain, Trophy, Zap, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { getLearnerStats } from '../services/progressService'
import { useLearning } from '../context/LearningContext'
import syllabusContent from '../data/syllabusContent.json'
import './QuizzesPage.css'

const normalize = (value) => String(value || '').trim().toLowerCase()

const QuizzesPage = ({ user }) => {
  const { language: contextLanguage, completedLessons } = useLearning()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const classLevel = user?.classLevel || 'S1'
  const language = user?.language || contextLanguage || 'luganda'

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const result = await getLearnerStats(user?._id, {
          completedLessons: completedLessons?.length ? completedLessons : (user?.completedLessons || [])
        })
        if (active) setStats(result)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user, completedLessons])

  // Real quiz topics come from the curriculum for the learner's class & language.
  const quizzes = useMemo(() => {
    if (!stats) return []
    const topics = syllabusContent.filter(
      (entry) => entry.class === classLevel && normalize(entry.language) === normalize(language)
    )

    return topics.map((entry, index) => {
      // Match stored attempts (keyed by quiz topic) to this syllabus topic.
      const attempts = stats.quizAttempts.filter((a) => normalize(a.quizId) === normalize(entry.topic))
      const bestScore = attempts.length
        ? Math.round(Math.max(...attempts.map((a) => a.percentage ?? 0)))
        : null
      return {
        id: `${classLevel}-${index}`,
        title: entry.topic,
        weekRange: entry.week_range,
        attempts: attempts.length,
        completed: attempts.length > 0,
        bestScore
      }
    })
  }, [stats, classLevel, language])

  if (loading) {
    return <div className="quizzes-page loading">Loading your quizzes...</div>
  }

  const completedCount = quizzes.filter((q) => q.completed).length

  return (
    <div className="quizzes-page">
      <div className="quizzes-header">
        <h1>Available Quizzes</h1>
        <p>Test your knowledge and track your progress</p>
      </div>

      {/* Quiz stats summarize real performance across all attempts. */}
      <div className="quizzes-stats">
        <div className="stat-box">
          <Brain size={24} />
          <div>
            <h3>Quizzes Completed</h3>
            <p>{completedCount} / {quizzes.length}</p>
          </div>
        </div>
        <div className="stat-box">
          <Trophy size={24} />
          <div>
            <h3>Average Score</h3>
            <p>{stats.quizCount > 0 ? `${stats.avgQuizScore}%` : '—'}</p>
          </div>
        </div>
        <div className="stat-box">
          <Zap size={24} />
          <div>
            <h3>Best Score</h3>
            <p>{stats.quizCount > 0 ? `${stats.bestQuizScore}%` : '—'}</p>
          </div>
        </div>
      </div>

      <div className="quizzes-hint">
        <MapPin size={16} />
        <span>Open a week from your Learning Path on the Home page to take or retake its quiz.</span>
      </div>

      {/* Each card is a real syllabus topic with the learner's actual attempt history. */}
      {quizzes.length > 0 ? (
        <div className="quizzes-grid">
          {quizzes.map((quiz, idx) => (
            <motion.div
              key={quiz.id}
              className={`quiz-card ${quiz.completed ? 'completed' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="quiz-icon">
                <Brain size={32} />
              </div>
              <h3>{quiz.title}</h3>
              <div className="quiz-meta">
                <span className="difficulty easy">Weeks {quiz.weekRange}</span>
                {quiz.completed && <span className="score">{quiz.bestScore}%</span>}
              </div>
              {quiz.completed ? (
                <div className="quiz-result">
                  <p className="result-text">Best score: {quiz.bestScore}%</p>
                  <p className="attempt-text">Attempts: {quiz.attempts}</p>
                </div>
              ) : (
                <p className="locked-text">Not attempted yet</p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="quizzes-empty">
          <Brain size={40} />
          <p>No quiz topics found for {classLevel}. Check back as the curriculum loads.</p>
        </div>
      )}
    </div>
  )
}

export default QuizzesPage
