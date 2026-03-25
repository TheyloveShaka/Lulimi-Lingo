import React, { useState } from 'react'
import { Trophy, Star, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import './AchievementsPage.css'

const AchievementsPage = () => {
  const [achievements] = useState([
    { id: 1, name: 'First Steps', description: 'Complete your first lesson', icon: '👣', unlocked: true, date: '2024-01-15' },
    { id: 2, name: 'Quick Learner', description: 'Complete 5 lessons in a week', icon: '⚡', unlocked: true, date: '2024-01-20' },
    { id: 3, name: 'Quiz Master', description: 'Score 100% on a quiz', icon: '🎯', unlocked: true, date: '2024-02-01' },
    { id: 4, name: 'Consistent Learner', description: 'Maintain a 7-day learning streak', icon: '🔥', unlocked: true, date: '2024-02-10' },
    { id: 5, name: 'Vocabulary Master', description: 'Learn 100 new words', icon: '📚', unlocked: false },
    { id: 6, name: 'Speaking Champion', description: 'Complete all practice exercises', icon: '🎤', unlocked: false }
  ])

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h1>Achievements</h1>
        <p>Unlock badges as you progress in your learning journey</p>
        <div className="progress-summary">
          <p><strong>{unlockedCount}</strong> of <strong>{achievements.length}</strong> achievements unlocked</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}></div>
          </div>
        </div>
      </div>

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
            {achievement.unlocked && (
              <p className="unlock-date">Unlocked {new Date(achievement.date).toLocaleDateString()}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AchievementsPage
