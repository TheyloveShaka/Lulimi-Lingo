import React, { useState } from 'react'
import { User, Mail, BookOpen, Calendar, Edit2, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import './ProfilePage.css'

const ProfilePage = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    classLevel: user?.classLevel || 'S1',
    language: user?.language || 'luganda'
  })

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      {/* Profile fields are editable locally so learners can inspect their identity details. */}
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-avatar">
          <User size={64} />
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <p>{formData.name}</p>
            )}
          </div>

          <div className="info-group">
            <label>Email Address</label>
            <p>{formData.email}</p>
          </div>

          {user?.lin && (
            <div className="info-group">
              <label>Learner ID (LIN)</label>
              <p>{user.lin}</p>
            </div>
          )}

          <div className="info-group">
            <label>Class Level</label>
            {isEditing ? (
              <select
                value={formData.classLevel}
                onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
              >
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
                <option value="S4">S4</option>
              </select>
            ) : (
              <p>{formData.classLevel}</p>
            )}
          </div>

          <div className="info-group">
            <label>Learning Language</label>
            {isEditing ? (
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="luganda">Luganda</option>
                <option value="runyankole">Runyankole</option>
              </select>
            ) : (
              <p>{formData.language === 'luganda' ? 'Luganda' : 'Runyankole'}</p>
            )}
          </div>
        </div>

        <div className="profile-buttons">
          <motion.button
            className={`btn-edit ${isEditing ? 'cancel' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
            whileHover={{ scale: 1.05 }}
          >
            {isEditing ? 'Cancel' : <Edit2 size={18} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Summary stats here are read-only snapshots of the learner account. */}
      <motion.div
        className="profile-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat">
          <Calendar size={24} />
          <div>
            <h4>Member Since</h4>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="stat">
          <BookOpen size={24} />
          <div>
            <h4>Lessons Completed</h4>
            <p>{user?.completedLessons?.length || 0}</p>
          </div>
        </div>
      </motion.div>

      {/* Logout clears the session keys and returns to the public landing page. */}
      <motion.div
        className="logout-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          className="btn-logout"
          onClick={() => {
            localStorage.removeItem('authToken')
            localStorage.removeItem('lulimiLingoCurrentUser')
            window.location.href = '/'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={20} />
          Logout
        </motion.button>
      </motion.div>
    </div>
  )
}

export default ProfilePage
