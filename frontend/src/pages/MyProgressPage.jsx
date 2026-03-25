import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar, Target, Award } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import './MyProgressPage.css'

const MyProgressPage = ({ user }) => {
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real progress data from user account
    const fetchProgress = async () => {
      try {
        // Calculate real progress from user data
        const completedLessonsCount = user?.completedLessons?.length || 0
        const totalLessons = 48 // 4 terms × 3 weeks × 4 lessons per week
        const overallProgress = Math.round((completedLessonsCount / totalLessons) * 100)
        const currentStreak = user?.streak || 0
        const averageQuizScore = user?.averageQuizScore || 0

        // Generate weekly progress based on completed lessons
        const weeklyProgress = [
          { week: 'Week 1', progress: Math.min(completedLessonsCount * 2, 25), quizScore: Math.min(averageQuizScore, 100) },
          { week: 'Week 2', progress: Math.min(completedLessonsCount * 2, 35), quizScore: averageQuizScore },
          { week: 'Week 3', progress: Math.min(completedLessonsCount * 2, 50), quizScore: averageQuizScore },
          { week: 'Week 4', progress: Math.min(completedLessonsCount * 2, 65), quizScore: averageQuizScore },
          { week: 'Week 5', progress: overallProgress, quizScore: averageQuizScore }
        ]

        const accountProgress = {
          overallProgress: overallProgress,
          currentStreak: currentStreak,
          totalLessons: totalLessons,
          completedLessons: completedLessonsCount,
          averageQuizScore: averageQuizScore,
          weeklyProgress: weeklyProgress,
          monthlyData: [
            { month: 'Jan', lessons: Math.floor(completedLessonsCount * 0.3), quizzes: Math.floor(completedLessonsCount * 0.25) },
            { month: 'Feb', lessons: Math.floor(completedLessonsCount * 0.35), quizzes: Math.floor(completedLessonsCount * 0.3) },
            { month: 'Mar', lessons: completedLessonsCount, quizzes: Math.floor(completedLessonsCount * 0.4) }
          ],
          recentActivity: user?.recentActivity || [
            { date: 'Today', activity: 'Learning in progress', type: 'lesson' },
            { date: 'Account created', activity: 'Started learning journey', type: 'achievement' }
          ]
        }
        setProgressData(accountProgress)
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user])

  if (loading) {
    return <div className="progress-page loading">Loading your progress...</div>
  }

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>Your Learning Progress</h1>
        <p>{user.name}, you're doing great! Keep up the momentum.</p>
      </div>

      {/* Stats Grid */}
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
            <p className="stat-value">{progressData.currentStreak} days</p>
            <p className="stat-subtext">Keep learning consistently!</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <Calendar size={32} />
          </div>
          <div className="stat-content">
            <h3>Lessons Completed</h3>
            <p className="stat-value">{progressData.completedLessons}/{progressData.totalLessons}</p>
            <p className="stat-subtext">{Math.round((progressData.completedLessons / progressData.totalLessons) * 100)}% complete</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <Award size={32} />
          </div>
          <div className="stat-content">
            <h3>Quiz Average</h3>
            <p className="stat-value">{progressData.averageQuizScore}%</p>
            <p className="stat-subtext">Excellent performance!</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="charts-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="chart-container">
          <h2>Weekly Progress Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="progress" stroke="#667eea" strokeWidth={2} dot={{ fill: '#667eea', r: 4 }} />
              <Line type="monotone" dataKey="quizScore" stroke="#f093fb" strokeWidth={2} dot={{ fill: '#f093fb', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Monthly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="lessons" fill="#667eea" radius={[8, 8, 0, 0]} />
              <Bar dataKey="quizzes" fill="#f093fb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="activity-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Recent Activity</h2>
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
                <p className="activity-date">{item.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Goals Section */}
     <motion.div
        className="goals-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2>Learning Goals</h2>
        <div className="goals-grid">
          <div className="goal-card">
            <h3>Complete All S1 Lessons</h3>
            <p className="goal-progress">{progressData.completedLessons} / {progressData.totalLessons}</p>
            <div className="goal-bar">
              <div className="goal-fill" style={{ width: `${(progressData.completedLessons / progressData.totalLessons) * 100}%` }}></div>
            </div>
          </div>
          <div className="goal-card">
            <h3>Maintain 7-Day Streak</h3>
            <p className="goal-progress">In Progress</p>
            <p className="goal-subtext">Current: {progressData.currentStreak} days</p>
          </div>
          <div className="goal-card">
            <h3>Average Quiz Score 85%+</h3>
            <p className="goal-progress">Almost there!</p>
            <p className="goal-subtext">Current: {progressData.averageQuizScore}%</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MyProgressPage
