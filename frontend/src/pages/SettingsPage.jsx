import React, { useState } from 'react'
import { Bell, Moon, Volume2, Lock, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './SettingsPage.css'

const SettingsPage = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    soundEnabled: true,
    emailUpdates: true
  })

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('lulimiLingoCurrentUser')
    navigate('/')
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your preferences</p>
      </div>

      <div className="settings-sections">
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

          <div className="setting-item">
            <div className="setting-info">
              <Volume2 size={24} />
              <div>
                <h3>Sound Effects</h3>
                <p>Play sounds for quiz completions</p>
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
              />
              <span></span>
            </label>
          </div>
        </motion.div>

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

        <motion.div
          className="settings-section danger-zone"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
