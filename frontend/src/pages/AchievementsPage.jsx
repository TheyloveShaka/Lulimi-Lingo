import React, { useEffect, useState } from 'react'
import { Star, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { getLearnerStats } from '../services/progressService'
import { useLearning } from '../context/LearningContext'
import './AchievementsPage.css'

// Achievements are derived from real learner stats. Each badge declares the
// condition that unlocks it and a short progress hint, so nothing is faked.
const ACHIEVEMENT_DEFS = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '👣',
    isUnlocked: (s) => s.lessonsCompleted >= 1,
    progress: (s) => `${Math.min(s.lessonsCompleted, 1)}/1 lessons`
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete 5 lessons',
    icon: '⚡',
    isUnlocked: (s) => s.lessonsCompleted >= 5,
    progress: (s) => `${Math.min(s.lessonsCompleted, 5)}/5 lessons`
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Score 100% on a quiz',
    icon: '🎯',
    isUnlocked: (s) => s.bestQuizScore >= 100,
    progress: (s) => `Best score: ${s.bestQuizScore}%`
  },
  {
    id: 'consistent-learner',
    name: 'Consistent Learner',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    isUnlocked: (s) => s.currentStreak >= 7,
    progress: (s) => `${Math.min(s.currentStreak, 7)}/7 day streak`
  },
  {
    id: 'practice-pro',
    name: 'Practice Pro',
    description: 'Complete 10 practice sessions',
    icon: '📚',
    isUnlocked: (s) => s.practiceCount >= 10,
    progress: (s) => `${Math.min(s.practiceCount, 10)}/10 sessions`
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Reach an 85% quiz average',
    icon: '🎓',
    isUnlocked: (s) => s.quizCount >= 3 && s.avgQuizScore >= 85,
    progress: (s) => s.quizCount >= 3 ? `Average: ${s.avgQuizScore}%` : `${s.quizCount}/3 quizzes`
  }
]

const AchievementsPage = ({ user }) => {
  const { completedLessons } = useLearning()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (loading || !stats) {
    return <div className="achievements-page loading">Loading achievements...</div>
  }

  const achievements = ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    unlocked: def.isUnlocked(stats),
    progressText: def.progress(stats)
  }))
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h1>Achievements</h1>
        <p>Unlock badges as you progress in your learning journey</p>
        {/* The progress bar shows how far through the badge set the learner has gone. */}
        <div className="progress-summary">
          <p><strong>{unlockedCount}</strong> of <strong>{achievements.length}</strong> achievements unlocked</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Cards are split into unlocked and locked states so progress feels visible. */}
      <div className="achievements-grid">
        {achievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
          >
            <div className="achievement-icon">
              {achievement.unlocked ? (
                <>
                  <span className="emoji">{achievement.icon}</span>
                  <Star className="star-icon" size={20} />
                </>
              ) : (
                <>
                  <span className="emoji-locked">{achievement.icon}</span>
                  <Lock className="lock-icon" size={20} />
                </>
              )}
            </div>
            <h3>{achievement.name}</h3>
            <p className="description">{achievement.description}</p>
            <p className={`unlock-date ${achievement.unlocked ? '' : 'pending'}`}>
              {achievement.unlocked ? 'Unlocked' : achievement.progressText}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AchievementsPage
