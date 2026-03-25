import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUp, Users, BarChart3, Settings, LogOut, ChevronDown, Upload, X, Eye, Download, Trash2, Printer, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './AdminDashboard.css'

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('resources')
  const [resources, setResources] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentProgress, setStudentProgress] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    classLevel: 'S1',
    subject: 'Luganda',
    externalUrl: ''
  })

  // Fetch resources
  const fetchResources = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/teacher/resources', {
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

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/teacher/students', {
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

  // Fetch student progress
  const fetchStudentProgress = async (studentId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/teacher/student/${studentId}/progress`, {
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

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources()
    } else if (activeTab === 'students') {
      fetchStudents()
    }
  }, [activeTab])

  const handleUploadResource = async () => {
    try {
      if (!formData.title || !formData.externalUrl) {
        alert('Please fill in all required fields')
        return
      }

      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          fileName: formData.title
        })
      })

      if (response.ok) {
        alert('Resource uploaded successfully!')
        setShowUploadModal(false)
        setFormData({
          title: '',
          description: '',
          type: 'document',
          classLevel: 'S1',
          subject: 'Luganda',
          externalUrl: ''
        })
        fetchResources()
      } else {
        alert('Failed to upload resource')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Error uploading resource')
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/resources/${resourceId}`, {
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
    setSelectedStudent(student)
    fetchStudentProgress(student._id)
  }

  const handlePrintResults = () => {
    if (!studentProgress) return

    window.print()
  }

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                  <motion.button
                    className="btn-primary"
                    onClick={() => setShowUploadModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload size={18} />
                    Upload Resource
                  </motion.button>
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
                              <span className="student-class">{student.classLevel}</span>
                            </div>
                            <ChevronDown size={18} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress Details */}
                  {selectedStudent && studentProgress && (
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
                          <p className="big-number">
                            {studentProgress.progress[0]?.completionPercentage || 0}%
                          </p>
                        </div>
                        <div className="summary-card">
                          <h4>Average Score</h4>
                          <p className="big-number">
                            {(studentProgress.progress[0]?.averageScore || 0).toFixed(1)}%
                          </p>
                        </div>
                        <div className="summary-card">
                          <h4>Total Score</h4>
                          <p className="big-number">
                            {studentProgress.progress[0]?.totalScore || 0}
                          </p>
                        </div>
                      </div>

                      <div className="quiz-attempts">
                        <h4>Quiz Attempts</h4>
                        {studentProgress.progress[0]?.quizAttempts?.length > 0 ? (
                          <div className="attempts-list">
                            {studentProgress.progress[0].quizAttempts.map((attempt, idx) => (
                              <div key={idx} className="attempt-item">
                                <span className="attempt-quiz">Quiz {attempt.quizId}</span>
                                <span className="attempt-score">{attempt.percentage}%</span>
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
                  )}
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

                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h3>Total Students</h3>
                    <p className="stat-number">{students.length}</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Total Resources</h3>
                    <p className="stat-number">{resources.length}</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Avg. Class Progress</h3>
                    <p className="stat-number">
                      {students.length > 0
                        ? ((students.reduce((acc, s) => acc + (s.progressPercentage || 0), 0) / students.length) || 0).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="analytics-card">
                    <h3>Resources Viewed</h3>
                    <p className="stat-number">
                      {resources.reduce((acc, r) => acc + (r.viewCount || 0), 0)}
                    </p>
                  </div>
                </div>
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

                <div className="form-group">
                  <label>URL Link *</label>
                  <input
                    type="url"
                    placeholder="https://example.com/resource"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  />
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
