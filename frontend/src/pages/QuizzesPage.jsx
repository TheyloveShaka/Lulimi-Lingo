import React, { useState, useEffect } from 'react'
import { Brain, Trophy, BarChart3, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import './QuizzesPage.css'

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([])

  useEffect(() => {
    const mockQuizzes = [
      { id: 1, title: 'Greetings Quiz', completed: true, score: 95, total: 100, attempts: 1, difficulty: 'Easy' },
      { id: 2, title: 'Family Members', completed: true, score: 88, total: 100, attempts: 2, difficulty: 'Easy' },
      { id: 3, title: 'Numbers & Counting', completed: true, score: 92, total: 100, attempts: 1, difficulty: 'Medium' },
      { id: 4, title: 'Grammar Basics', completed: false, score: null, total: 100, attempts: 0, difficulty: 'Medium' },
      { id: 5, title: 'Conversational Skills', disabled: true, score: null, total: 100, attempts: 0, difficulty: 'Hard' }
    ]
    setQuizzes(mockQuizzes)
  }, [])

  return (
    <div className="quizzes-page">
      <div className="quizzes-header">
        <h1>Available Quizzes</h1>
        <p>Test your knowledge and track your progress</p>
      </div>

      <div className="quizzes-stats">
        <div className="stat-box">
          <Brain size={24} />
          <div>
            <h3>Quizzes Completed</h3>
            <p>{quizzes.filter(q => q.completed).length} / {quizzes.length}</p>
          </div>
        </div>
        <div className="stat-box">
          <Trophy size={24} />
          <div>
            <h3>Average Score</h3>
            <p>{quizzes.filter(q => q.completed).length > 0 ? Math.round(quizzes.filter(q => q.completed).reduce((acc, q) => acc + q.score, 0) / quizzes.filter(q => q.completed).length) : 0}%</p>
          </div>
        </div>
        <div className="stat-box">
          <Zap size={24} />
          <div>
            <h3>Best Score</h3>
            <p>{quizzes.filter(q => q.completed).length > 0 ? Math.max(...quizzes.filter(q => q.completed).map(q => q.score)) : 0}%</p>
          </div>
        </div>
      </div>

      <div className="quizzes-grid">
        {quizzes.map((quiz, idx) => (
          <motion.div
            key={quiz.id}
            className={`quiz-card ${quiz.completed ? 'completed' : ''} ${quiz.disabled ? 'disabled' : ''}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={!quiz.disabled ? { scale: 1.05 } : {}}
          >
            <div className="quiz-icon">
              <Brain size={32} />
            </div>
            <h3>{quiz.title}</h3>
            <div className="quiz-meta">
              <span className={`difficulty ${quiz.difficulty.toLowerCase()}`}>{quiz.difficulty}</span>
              {quiz.completed && <span className="score">{quiz.score}%</span>}
            </div>
            {quiz.completed ? (
              <div className="quiz-result">
                <p className="result-text">Score: {quiz.score}/{quiz.total}</p>
                <p className="attempt-text">Attempts: {quiz.attempts}</p>
                <button className="btn-retake">Retake Quiz</button>
              </div>
            ) : quiz.disabled ? (
              <p className="locked-text">Complete prerequisites first</p>
            ) : (
              <button className="btn-start-quiz">Start Quiz</button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default QuizzesPage
