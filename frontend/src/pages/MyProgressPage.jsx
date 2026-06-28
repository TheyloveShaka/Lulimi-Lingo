import React, { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Target, Award } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { getLearnerStats } from '../services/progressService'
import { useLearning } from '../context/LearningContext'
import './MyProgressPage.css'

const formatRelativeDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (date.toDateString() === today) return 'Today'
  if (date.toDateString() === yesterday) return 'Yesterday'
  return date.toLocaleDateString()
}

const MyProgressPage = ({ user }) => {
  const { completedLessons } = useLearning()
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pull the learner's real attempt history from the backend and aggregate it.
    let active = true
    const fetchProgress = async () => {
      setLoading(true)
      try {
        const stats = await getLearnerStats(user?._id, {
          completedLessons: completedLessons?.length ? completedLessons : (user?.completedLessons || [])
        })
        if (active) setProgressData(stats)
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchProgress()
    return () => { active = false }
  }, [user, completedLessons])

  if (loading) {
    return <div className="progress-page loading">Loading your progress...</div>
  }

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>Your Learning Progress</h1>
        <p>{user.name}, you're doing great! Keep up the momentum.</p>
      </div>

      {/* Stats summarize the current learning state at a glance. */}
      <motion.div
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="stat-card primary">
          <div className="stat-icon">
            <Target size={32} />
          </div>
          <div className="stat-content">
            <h3>Overall Progress</h3>
            <p className="stat-value">{progressData.overallProgress}%</p>
            <div className="stat-bar">
              <div className="stat-fill" style={{ width: `${progressData.overallProgress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <TrendingUp size={32} />
          </div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <p className="stat-value">{progressData.currentStreak} {progressData.currentStreak === 1 ? 'day' : 'days'}</p>
            <p className="stat-subtext">{progressData.currentStreak > 0 ? 'Keep it going!' : 'Practice today to start a streak'}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <Calendar size={32} />
          </div>
          <div className="stat-content">
            <h3>Lessons Completed</h3>
            <p className="stat-value">{progressData.lessonsCompleted}/{progressData.totalLessons}</p>
            <p className="stat-subtext">{progressData.overallProgress}% complete</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <Award size={32} />
          </div>
          <div className="stat-content">
            <h3>Quiz Average</h3>
            <p className="stat-value">{progressData.quizCount > 0 ? `${progressData.avgQuizScore}%` : '—'}</p>
            <p className="stat-subtext">{progressData.quizCount > 0 ? `Across ${progressData.quizCount} ${progressData.quizCount === 1 ? 'quiz' : 'quizzes'}` : 'No quizzes taken yet'}</p>
          </div>
        </div>
      </motion.div>

      {/* Charts are built from real quiz attempts grouped by syllabus week. */}
      {progressData.weeklyTrend.length > 0 ? (
        <motion.div
          className="charts-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="chart-container">
            <h2>Quiz Scores by Week</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" name="Avg score (%)" dataKey="quizScore" stroke="#667eea" strokeWidth={2} dot={{ fill: '#667eea', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2>Quizzes Taken by Week</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="attempts" name="Attempts" fill="#f093fb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="progress-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Award size={40} />
          <h2>No quiz history yet</h2>
          <p>Complete a lesson and take your first quiz — your progress charts will appear here.</p>
        </motion.div>
      )}

      {/* Recent activity is a real feed of the learner's latest quiz/practice attempts. */}
      <motion.div
        className="activity-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Recent Activity</h2>
        {progressData.recentActivity.length > 0 ? (
          <div className="activity-list">
            {progressData.recentActivity.map((item, idx) => (
              <motion.div
                key={idx}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className={`activity-badge ${item.type}`}></div>
                <div className="activity-content">
                  <p className="activity-action">{item.activity}</p>
                  <p className="activity-date">{formatRelativeDate(item.date)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="activity-empty">No activity recorded yet. Start a lesson to begin tracking your progress.</p>
        )}
      </motion.div>

      {/* Goals turn real progress into simple next targets. */}
     <motion.div
        className="goals-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2>Learning Goals</h2>
        <div className="goals-grid">
          <div className="goal-card">
            <h3>Complete the Curriculum</h3>
            <p className="goal-progress">{progressData.lessonsCompleted} / {progressData.totalLessons} lessons</p>
            <div className="goal-bar">
              <div className="goal-fill" style={{ width: `${progressData.overallProgress}%` }}></div>
            </div>
          </div>
          <div className="goal-card">
            <h3>Maintain a 7-Day Streak</h3>
            <p className="goal-progress">{progressData.currentStreak >= 7 ? 'Achieved! 🔥' : 'In progress'}</p>
            <p className="goal-subtext">Current: {progressData.currentStreak} {progressData.currentStreak === 1 ? 'day' : 'days'}</p>
          </div>
          <div className="goal-card">
            <h3>Average Quiz Score 85%+</h3>
            <p className="goal-progress">{progressData.quizCount === 0 ? 'Not started' : progressData.avgQuizScore >= 85 ? 'Achieved! 🌟' : 'Keep going'}</p>
            <p className="goal-subtext">Current: {progressData.quizCount > 0 ? `${progressData.avgQuizScore}%` : '—'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MyProgressPage
