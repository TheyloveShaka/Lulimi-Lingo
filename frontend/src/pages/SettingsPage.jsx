import React, { useState } from 'react'
import { Bell, Moon, Lock, LogOut, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLearning } from '../context/LearningContext'
import './SettingsPage.css'

const SettingsPage = () => {
  const navigate = useNavigate()
  const { resetProgress } = useLearning()
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailUpdates: true
  })
  const [resetDone, setResetDone] = useState(false)

  const handleLogout = () => {
    // Session state lives in localStorage, so logout removes those keys first.
    localStorage.removeItem('authToken')
    localStorage.removeItem('lulimiLingoCurrentUser')
    navigate('/')
  }

  const handleResetProgress = () => {
    if (!window.confirm('Reset all your learning progress? This clears completed lessons, quiz scores, and your streak. This cannot be undone.')) {
      return
    }
    resetProgress()
    setResetDone(true)
    setTimeout(() => setResetDone(false), 3000)
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your preferences</p>
      </div>

      {/* Settings are grouped so the learner can scan preferences quickly. */}
      <div className="settings-sections">
        {/* Notifications control the nudges that keep practice going. */}
        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Notifications</h2>

          <div className="setting-item">
            <div className="setting-info">
              <Bell size={24} />
              <div>
                <h3>Push Notifications</h3>
                <p>Receive notifications for lessons and quizzes</p>
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              />
              <span></span>
            </label>
          </div>

        </motion.div>

        {/* Preferences change how the app feels while the user is studying. */}
        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2>Preferences</h2>

          <div className="setting-item">
            <div className="setting-info">
              <Moon size={24} />
              <div>
                <h3>Dark Mode</h3>
                <p>Easier on the eyes</p>
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
              />
              <span></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <Lock size={24} />
              <div>
                <h3>Email Updates</h3>
                <p>Receive updates about your progress</p>
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.emailUpdates}
                onChange={(e) => setSettings({ ...settings, emailUpdates: e.target.checked })}
              />
              <span></span>
            </label>
          </div>
        </motion.div>

        {/* Learning data controls let the learner start fresh if they want. */}
        <motion.div
          className="settings-section danger-zone"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Learning Progress</h2>

          <div className="setting-item">
            <div className="setting-info">
              <RotateCcw size={24} />
              <div>
                <h3>Reset Progress</h3>
                <p>Clear completed lessons, quiz scores, and your streak to start over</p>
              </div>
            </div>
            <motion.button
              className="btn-reset-progress"
              onClick={handleResetProgress}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {resetDone ? 'Progress reset ✓' : 'Reset'}
            </motion.button>
          </div>
        </motion.div>

        {/* The session section is intentionally small because logout is the main action here. */}
        <motion.div
          className="settings-section danger-zone"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2>Session</h2>

          <motion.button
            className="btn-logout"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} />
            Log Out
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage
