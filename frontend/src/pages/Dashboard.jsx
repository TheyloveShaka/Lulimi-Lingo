import React, { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import LevelLadder from '../components/dashboard/LevelLadder'
import ChatbotDock from '../components/dashboard/ChatbotDock'
import WeekModal from '../components/dashboard/WeekModal'
import './Dashboard.css'

const Dashboard = ({ user }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('luganda') // luganda or runyankole

  const userName = user?.name || 'Student'

  const handleWeekClick = (week) => {
    setSelectedWeek(week)
  }

  const closeWeekModal = () => {
    setSelectedWeek(null)
  }

  return (
    <div className="dashboard">
      <Sidebar 
        expanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)} 
      />
      
      <main className={`dashboard-main ${!sidebarExpanded ? 'sidebar-collapsed' : ''}`}>
        {/* Hero Background */}
        <div className="hero-background">
          <img src="/images/hero.jpeg" alt="Hero" />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {userName}! 🎉</h1>
            <p>Continue your {selectedLanguage === 'luganda' ? 'Luganda' : 'Runyankole'} learning journey</p>
          </div>
          
          <div className="language-toggle">
            <button 
              className={`language-btn ${selectedLanguage === 'luganda' ? 'active' : ''}`}
              onClick={() => setSelectedLanguage('luganda')}
            >
              Luganda
            </button>
            <button 
              className={`language-btn ${selectedLanguage === 'runyankole' ? 'active' : ''}`}
              onClick={() => setSelectedLanguage('runyankole')}
            >
              Runyankole
            </button>
          </div>
          
          <div className="progress-overview">
            <div className="progress-stat">
              <span className="stat-label">Overall Progress</span>
              <div className="stat-value">
                <span className="stat-number">35%</span>
                <div className="progress-bar-small">
                  <div className="progress-fill" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
            <div className="progress-stat">
              <span className="stat-label">Current Streak</span>
              <div className="stat-value">
                <span className="stat-number">7 days 🔥</span>
              </div>
            </div>
          </div>
        </div>

        <LevelLadder onWeekClick={handleWeekClick} selectedLanguage={selectedLanguage} />
      </main>

      <ChatbotDock isOpen={chatbotOpen} onToggle={() => setChatbotOpen(!chatbotOpen)} />

      {selectedWeek && (
        <WeekModal week={selectedWeek} onClose={closeWeekModal} />
      )}
    </div>
  )
}

export default Dashboard
