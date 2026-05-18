import React from 'react'
import { motion } from 'framer-motion'
import { Award, Sparkles, CheckCircle, AlertCircle, BookOpen, ArrowRight } from 'lucide-react'
import './ResultsView.css'

const getGrade = (percentage) => {
  if (percentage >= 90) return { label: 'A', tone: 'excellent', message: 'Excellent mastery' }
  if (percentage >= 80) return { label: 'B', tone: 'strong', message: 'Strong performance' }
  if (percentage >= 70) return { label: 'C', tone: 'steady', message: 'Solid progress' }
  if (percentage >= 60) return { label: 'D', tone: 'growing', message: 'Keep building momentum' }
  return { label: 'F', tone: 'focus', message: 'Needs more practice' }
}

const formatFeedbackText = (feedback) => {
  if (!feedback) return ''
  if (typeof feedback === 'string') return feedback.trim()
  if (typeof feedback === 'object') {
    return String(feedback.summary || feedback.feedback?.summary || feedback.raw || '').trim()
  }
  return ''
}

const splitSummaryLines = (text) => {
  return String(text || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

const ResultsView = ({ topic, resultsData, onDone }) => {
  const results = resultsData?.results || null
  const feedback = resultsData?.feedback || null

  if (!results) {
    return (
      <motion.div
        className="results-view empty"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="results-empty-card">
          <Sparkles size={24} />
          <h3>Results are loading</h3>
          <p>Finish the quiz to see your score, corrections, and AI feedback here.</p>
        </div>
      </motion.div>
    )
  }

  const grade = getGrade(results.percentage)
  const feedbackText = formatFeedbackText(feedback)
  const feedbackLines = splitSummaryLines(feedbackText)
  const incorrectItems = (results.details || []).filter((detail) => !detail.isCorrect)
  const correctCount = (results.details || []).filter((detail) => detail.isCorrect).length

  return (
    <motion.div
      className="results-view"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={`results-hero ${grade.tone}`}>
        <div className="results-hero-copy">
          <div className="results-kicker">
            <Award size={16} /> Quiz results
          </div>
          <h2>{topic ? `${topic}` : 'Quiz complete'}</h2>
          <p>{grade.message}</p>
        </div>

        <div className="results-score-ring" aria-label={`Score ${results.percentage}%`}>
          <span className="score-value">{results.percentage}%</span>
          <span className="score-label">{grade.label}</span>
        </div>
      </div>

      <div className="results-stats">
        <div className="stat-card">
          <span className="stat-value">{results.score}</span>
          <span className="stat-label">Points earned</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{results.maxScore}</span>
          <span className="stat-label">Points possible</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{correctCount}</span>
          <span className="stat-label">Correct answers</span>
        </div>
      </div>

      <section className="results-panel ai-panel">
        <div className="panel-heading">
          <Sparkles size={18} /> AI summary
        </div>
        {feedbackText ? (
          <div className="ai-summary">
            {feedbackLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        ) : (
          <div className="ai-summary loading">Generating your AI summary and corrections...</div>
        )}
      </section>

      <section className="results-panel corrections-panel">
        <div className="panel-heading">
          <BookOpen size={18} /> Corrections
        </div>

        <div className="corrections-list">
          {results.details?.map((detail, index) => (
            <article key={index} className={`correction-card ${detail.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="correction-header">
                <div className="correction-status">
                  {detail.isCorrect ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{detail.isCorrect ? 'Correct' : 'Needs review'}</span>
                </div>
                <span className="correction-points">{detail.points}/{detail.maxPoints} pts</span>
              </div>

              <h3>{detail.question}</h3>

              <div className="answer-grid">
                <div>
                  <span className="answer-label">Your answer</span>
                  <p>{detail.userAnswer || 'No answer'}</p>
                </div>
                <div>
                  <span className="answer-label">Correct answer</span>
                  <p>{detail.correctAnswer || '—'}</p>
                </div>
              </div>

              {detail.explanation && <p className="explanation">{detail.explanation}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="results-panel focus-panel">
        <div className="panel-heading">
          <ArrowRight size={18} /> Next practice focus
        </div>
        {incorrectItems.length > 0 ? (
          <ul className="focus-list">
            {incorrectItems.map((item, index) => (
              <li key={index}>{item.correctAnswer || item.question}</li>
            ))}
          </ul>
        ) : (
          <p className="focus-success">You answered everything correctly. Review the summary and continue.</p>
        )}
      </section>

      <div className="results-actions">
        <button className="action-btn primary" onClick={onDone}>
          Continue Learning
        </button>
      </div>
    </motion.div>
  )
}

export default ResultsView