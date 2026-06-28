import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUp, Users, BarChart3, Settings, LogOut, ChevronDown, Upload, X, Eye, Download, Trash2, Printer, Search, Database } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { aggregateProgress } from '../services/progressService'
import './AdminDashboard.css'

// The teacher dashboard talks to the same live Node backend as the rest of the
// app. Without this base, relative "/api/..." calls hit the frontend host and
// fail (this was the cause of the resource upload error).
const NODE_BACKEND_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://lulimi-lingo-production.up.railway.app'

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('resources')
  const [resources, setResources] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentProgress, setStudentProgress] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSeedModal, setShowSeedModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [studentEmail, setStudentEmail] = useState('')
  const [attachingStudent, setAttachingStudent] = useState(false)
  const [analytics, setAnalytics] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    classLevel: 'S1',
    subject: 'Luganda',
    externalUrl: '',
    file: null
  })

  const defaultSubject = user?.language === 'runyankole' ? 'Runyankole' : 'Luganda'

  // Admins manage two things here: resources and student progress.
  const fetchResources = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${NODE_BACKEND_URL}/api/teacher/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setResources(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  // Student lists power the teacher/admin progress review workflow.
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${NODE_BACKEND_URL}/api/teacher/students`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setStudents(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  // Progress drill-down shows what a teacher needs before giving feedback.
  const fetchStudentProgress = async (studentId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${NODE_BACKEND_URL}/api/teacher/student/${studentId}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setStudentProgress(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch student progress:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user.role !== 'teacher' && user.role !== 'admin') {
      navigate('/dashboard')
    }
  }, [user.role, navigate])

  // Class-wide analytics aggregated from real student attempts on the backend.
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${NODE_BACKEND_URL}/api/teacher/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data || null)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources()
    } else if (activeTab === 'students') {
      fetchStudents()
    } else if (activeTab === 'analytics') {
      fetchAnalytics()
    }
  }, [activeTab])

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      subject: prev.subject || defaultSubject
    }))
  }, [defaultSubject])

  const handleUploadResource = async () => {
    try {
      // Teachers can upload either a direct URL or a file attachment (not both required).
      if (!formData.title) {
        alert('Please enter a resource title')
        return
      }
      if (!formData.externalUrl && !formData.file) {
        alert('Add a URL link OR choose a file to upload')
        return
      }

      const subject = formData.subject || defaultSubject

      const token = localStorage.getItem('authToken')
      let response

      if (formData.file) {
        // Convert the file to base64 so it can be posted as JSON.
        const toBase64 = (file) => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const base64 = await toBase64(formData.file)
        response = await fetch(`${NODE_BACKEND_URL}/api/resources`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            file: undefined,
            subject,
            fileName: formData.file.name,
            fileSize: formData.file.size,
            fileMimeType: formData.file.type || 'application/octet-stream',
            fileBase64: base64
          })
        })
      } else {
        response = await fetch(`${NODE_BACKEND_URL}/api/resources`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            subject,
            fileName: formData.title
          })
        })
      }

      if (response.ok) {
        alert('Resource uploaded successfully!')
        setShowUploadModal(false)
        setFormData({
          title: '',
          description: '',
          type: 'document',
          classLevel: 'S1',
          subject: defaultSubject,
          externalUrl: '',
          file: null
        })
        fetchResources()
      } else {
        // Surface the real backend reason so failures are diagnosable.
        let reason = `${response.status} ${response.statusText}`
        try {
          const errData = await response.json()
          if (errData?.error) reason = errData.error
        } catch (_) { /* response had no JSON body */ }
        alert(`Failed to upload resource: ${reason}`)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`Error uploading resource: ${error.message}`)
    }
  }

  const handleSeedResources = async () => {
    try {
      // Seeding helps bootstrap the resource library with starter content.
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${NODE_BACKEND_URL}/api/resources/seed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok) {
        alert(`Seeded ${data.count || 0} resources.`)
        fetchResources()
      } else {
        alert(data.error || 'Failed to seed resources')
      }
    } catch (error) {
      console.error('Seed failed:', error)
      alert('Error seeding resources')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSeed = async () => {
    setShowSeedModal(false)
    await handleSeedResources()
  }

  const handleDeleteResource = async (resourceId) => {
    // Delete is destructive, so it asks for confirmation first.
    if (!window.confirm('Are you sure you want to delete this resource?')) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${NODE_BACKEND_URL}/api/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setResources(resources.filter(r => r._id !== resourceId))
        alert('Resource deleted successfully!')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Error deleting resource')
    }
  }

  const handleSelectStudent = (student) => {
    // Selecting a learner loads their progress into the right-hand panel.
    setSelectedStudent(student)
    fetchStudentProgress(student._id)
  }

  const handlePrintResults = () => {
    if (!studentProgress) return

    window.print()
  }

  const handleAttachStudent = async () => {
    // Attaching by email or LIN links a student to the teacher's dashboard.
    const identifier = studentEmail.trim()
    if (!identifier) {
      alert('Enter a student email or LIN')
      return
    }

    try {
      setAttachingStudent(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${NODE_BACKEND_URL}/api/teacher/students/attach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ identifier })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to attach student')
      }

      setStudentEmail('')
      await fetchStudents()
      alert('Student attached successfully')
    } catch (error) {
      console.error('Attach student failed:', error)
      alert(error.message)
    } finally {
      setAttachingStudent(false)
    }
  }

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase()
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.lin?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <h1>Lulimi Lingo Admin</h1>
            <p>Teacher Dashboard</p>
          </div>
          <div className="admin-user-info">
            <span>{user.name}</span>
            <button onClick={() => navigate('/')} className="logout-btn">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="admin-main">
        {/* Tabs */}
        <div className="admin-tabs">
          <motion.button
            className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
            whileHover={{ scale: 1.05 }}
          >
            <FileUp size={20} />
            <span>Resources</span>
          </motion.button>
          <motion.button
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
            whileHover={{ scale: 1.05 }}
          >
            <Users size={20} />
            <span>Student Progress</span>
          </motion.button>
          <motion.button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            whileHover={{ scale: 1.05 }}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </motion.button>
        </div>

        {/* Content */}
        <div className="admin-content">
          <AnimatePresence mode="wait">
            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                className="tab-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="section-header">
                  <h2>Educational Resources</h2>
                  <div className="section-actions">
                    <motion.button
                      className="btn-secondary"
                      onClick={() => setShowSeedModal(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading}
                    >
                      <Database size={18} />
                      Seed Resources
                    </motion.button>
                    <motion.button
                      className="btn-primary"
                      onClick={() => setShowUploadModal(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading}
                    >
                      <Upload size={18} />
                      Upload Resource
                    </motion.button>
                  </div>
                </div>

                {/* Search */}
                <div className="search-box">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Resources List */}
                <div className="resources-grid">
                  {loading ? (
                    <p>Loading resources...</p>
                  ) : filteredResources.length === 0 ? (
                    <div className="empty-state">
                      <FileUp size={48} />
                      <p>No resources yet. Upload your first resource!</p>
                    </div>
                  ) : (
                    filteredResources.map(resource => (
                      <motion.div
                        key={resource._id}
                        className="resource-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="resource-header">
                          <h3>{resource.title}</h3>
                          <span className={`resource-type ${resource.type}`}>
                            {resource.type}
                          </span>
                        </div>
                        <p className="resource-description">{resource.description}</p>
                        <div className="resource-meta">
                          <span className="meta-item">
                            <strong>Class:</strong> {resource.classLevel}
                          </span>
                          <span className="meta-item">
                            <strong>Subject:</strong> {resource.subject}
                          </span>
                        </div>
                        <div className="resource-stats">
                          <span>
                            <Eye size={16} /> {resource.viewCount || 0} views
                          </span>
                          <span>
                            <Download size={16} /> {resource.downloadCount || 0} downloads
                          </span>
                        </div>
                        <div className="resource-actions">
                          <motion.button
                            className="btn-icon"
                            title="Delete resource"
                            onClick={() => handleDeleteResource(resource._id)}
                            whileHover={{ scale: 1.1, color: '#ff4444' }}
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <AnimatePresence>
                  {showSeedModal && (
                    <motion.div
                      className="modal-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowSeedModal(false)}
                    >
                      <motion.div
                        className="modal-content seed-modal"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="modal-header">
                          <h2>Seed Resources</h2>
                          <button className="modal-close" onClick={() => setShowSeedModal(false)}>
                            <X size={20} />
                          </button>
                        </div>
                        <div className="modal-body">
                          <p>This will import the default Luganda and Runyankole YouTube resources into the library.</p>
                        </div>
                        <div className="modal-actions">
                          <button className="btn-secondary" onClick={() => setShowSeedModal(false)}>
                            Cancel
                          </button>
                          <button className="btn-primary" onClick={handleConfirmSeed} disabled={loading}>
                            Seed Now
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <motion.div
                key="students"
                className="tab-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="section-header">
                  <h2>Student Progress & Results</h2>
                </div>

                <div className="attach-student-panel">
                  <div>
                    <h3>Attach Student by Email or LIN</h3>
                    <p>Link a learner to your account so their progress, quiz history, and analytics show here.</p>
                  </div>
                  <div className="attach-student-form">
                    <input
                      type="text"
                      placeholder="student@example.com or LIN"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                    />
                    <motion.button
                      className="btn-primary"
                      type="button"
                      onClick={handleAttachStudent}
                      disabled={attachingStudent}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {attachingStudent ? 'Attaching...' : 'Attach Student'}
                    </motion.button>
                  </div>
                </div>

                <div className="students-container">
                  {/* Students List */}
                  <div className="students-list-section">
                    <div className="search-box">
                      <Search size={20} />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {loading ? (
                      <p>Loading students...</p>
                    ) : filteredStudents.length === 0 ? (
                      <div className="empty-state">
                        <Users size={48} />
                        <p>No students yet</p>
                      </div>
                    ) : (
                      <div className="students-list">
                        {filteredStudents.map(student => (
                          <motion.div
                            key={student._id}
                            className={`student-item ${selectedStudent?._id === student._id ? 'active' : ''}`}
                            onClick={() => handleSelectStudent(student)}
                            whileHover={{ x: 5 }}
                          >
                            <div className="student-info">
                              <h4>{student.name}</h4>
                              <p>{student.email}</p>
                              {student.lin && <p className="student-lin">LIN: {student.lin}</p>}
                              <span className="student-class">{student.classLevel}</span>
                            </div>
                            <ChevronDown size={18} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress Details — aggregated across every week the student has worked on. */}
                  {selectedStudent && studentProgress && (() => {
                    const agg = aggregateProgress(studentProgress.progress || [])
                    return (
                    <div className="progress-details-section">
                      <div className="progress-header">
                        <h3>{selectedStudent.name}'s Progress</h3>
                        <motion.button
                          className="btn-icon print-btn"
                          onClick={handlePrintResults}
                          whileHover={{ scale: 1.1 }}
                          title="Print results"
                        >
                          <Printer size={18} />
                        </motion.button>
                      </div>

                      <div className="progress-summary">
                        <div className="summary-card">
                          <h4>Overall Progress</h4>
                          <p className="big-number">{agg.overallProgress}%</p>
                        </div>
                        <div className="summary-card">
                          <h4>Average Score</h4>
                          <p className="big-number">{agg.quizCount > 0 ? `${agg.avgQuizScore}%` : '—'}</p>
                        </div>
                        <div className="summary-card">
                          <h4>Quizzes Taken</h4>
                          <p className="big-number">{agg.quizCount}</p>
                        </div>
                      </div>

                      <div className="quiz-attempts">
                        <h4>Quiz Attempts</h4>
                        {agg.quizAttempts.length > 0 ? (
                          <div className="attempts-list">
                            {agg.quizAttempts
                              .slice()
                              .sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate))
                              .map((attempt, idx) => (
                              <div key={idx} className="attempt-item">
                                <span className="attempt-quiz">{attempt.quizId || `Week ${attempt.weekId || '–'}`}</span>
                                <span className="attempt-score">{Math.round(attempt.percentage ?? 0)}%</span>
                                <span className="attempt-date">
                                  {new Date(attempt.attemptDate).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="empty-text">No quiz attempts yet</p>
                        )}
                      </div>
                    </div>
                    )
                  })()}
                </div>
              </motion.div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                className="tab-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="section-header">
                  <h2>Class Analytics</h2>
                </div>

                {loading && !analytics ? (
                  <p>Loading analytics...</p>
                ) : (
                  <>
                    <div className="analytics-grid">
                      <div className="analytics-card">
                        <h3>Total Students</h3>
                        <p className="stat-number">{analytics?.totalStudents ?? students.length}</p>
                      </div>
                      <div className="analytics-card">
                        <h3>Active Students</h3>
                        <p className="stat-number">{analytics?.activeStudents ?? 0}</p>
                      </div>
                      <div className="analytics-card">
                        <h3>Class Avg. Quiz Score</h3>
                        <p className="stat-number">
                          {analytics?.totalQuizAttempts > 0 ? `${analytics.classAvgQuizScore}%` : '—'}
                        </p>
                      </div>
                      <div className="analytics-card">
                        <h3>Quizzes Taken</h3>
                        <p className="stat-number">{analytics?.totalQuizAttempts ?? 0}</p>
                      </div>
                      <div className="analytics-card">
                        <h3>Practice Sessions</h3>
                        <p className="stat-number">{analytics?.totalPracticeAttempts ?? 0}</p>
                      </div>
                      <div className="analytics-card">
                        <h3>Total Resources</h3>
                        <p className="stat-number">{resources.length}</p>
                      </div>
                    </div>

                    {/* Per-student breakdown so a teacher can compare learners at a glance. */}
                    <div className="analytics-table-wrap">
                      <h3>Student Breakdown</h3>
                      {analytics?.students?.length > 0 ? (
                        <table className="analytics-table">
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>LIN</th>
                              <th>Class</th>
                              <th>Lessons</th>
                              <th>Quizzes</th>
                              <th>Avg Score</th>
                              <th>Practice</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.students.map((s) => (
                              <tr key={s.id}>
                                <td>{s.name}</td>
                                <td>{s.lin || '—'}</td>
                                <td>{s.classLevel}</td>
                                <td>{s.lessonsCompleted}</td>
                                <td>{s.quizCount}</td>
                                <td>{s.quizCount > 0 ? `${s.avgQuizScore}%` : '—'}</td>
                                <td>{s.practiceCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="empty-text">No students attached yet. Attach students from the Student Progress tab.</p>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Upload Resource</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="modal-close"
                >
                  <X size={24} />
                </button>
              </div>

              <form className="upload-form">
                <div className="form-group">
                  <label>Resource Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Luganda Grammar Basics"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe your resource..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="document">Document</option>
                      <option value="link">Link</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Class Level</label>
                    <select
                      value={formData.classLevel}
                      onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    >
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                      <option value="S4">S4</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="Luganda">Luganda</option>
                    <option value="Runyankole">Runyankole</option>
                  </select>
                </div>

                <div className="form-hint">Provide a URL link <strong>or</strong> upload a file — either one works.</div>

                <div className="form-group">
                  <label>URL Link</label>
                  <input
                    type="url"
                    placeholder="https://example.com/resource"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    disabled={Boolean(formData.file)}
                  />
                </div>

                <div className="form-group">
                  <label>Or Upload File</label>
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  />
                  {formData.file && (
                    <span className="file-chosen">Selected: {formData.file.name}</span>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    className="btn-primary"
                    onClick={handleUploadResource}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Upload Resource
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminDashboard
