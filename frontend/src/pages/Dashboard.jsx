import React, { useState, useMemo, useEffect } from 'react'
import { useLearning } from '../context/LearningContext'
import { getLearnerStats } from '../services/progressService'
import Sidebar from '../components/dashboard/Sidebar'
import LevelLadder from '../components/dashboard/LevelLadder'
import ChatbotDock from '../components/dashboard/ChatbotDock'
import WeekModal from '../components/dashboard/WeekModal'
import MyProgressPage from './MyProgressPage'
import ClassesPage from './ClassesPage'
import QuizzesPage from './QuizzesPage'
import VocabularyPage from './VocabularyPage'
import AchievementsPage from './AchievementsPage'
import ResourcesPage from './ResourcesPage'
import ProfilePage from './ProfilePage'
import SettingsPage from './SettingsPage'
import HelpPage from './HelpPage'
import './Dashboard.css'

const Dashboard = ({ user }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const { language: selectedLanguage, completedLessons, completedTopics, currentStreak } = useLearning()
  const [liveStats, setLiveStats] = useState(null)

  // Everything on this screen is driven by the learner's stored progress.
  const userName = user?.name || 'Student'

  // Pull real attempt history from the backend so the header reflects actual activity.
  useEffect(() => {
    let active = true
    getLearnerStats(user?._id, {
      completedLessons: completedLessons?.length ? completedLessons : (user?.completedLessons || [])
    }).then((stats) => {
      if (active) setLiveStats(stats)
    })
    return () => { active = false }
  }, [user, completedLessons])

  // Prefer real backend stats; fall back to local context if the fetch is pending.
  const progressMetrics = useMemo(() => {
    const totalLessons = 48
    const completedLessonsCount = completedLessons?.length || 0
    const localProgress = Math.min(Math.round((completedLessonsCount / totalLessons) * 100), 100)

    return {
      overallProgress: liveStats?.overallProgress ?? localProgress,
      streak: liveStats?.currentStreak ?? (currentStreak || 0),
      avgQuizScore: liveStats?.avgQuizScore ?? 0,
      quizCount: liveStats?.quizCount ?? 0
    }
  }, [completedLessons, currentStreak, liveStats])

  const handleWeekClick = (week) => {
    setSelectedWeek(week)
  }

  const closeWeekModal = () => {
    setSelectedWeek(null)
  }

  // Render the correct page content based on current page
  const renderPageContent = () => {
    // Each sidebar option swaps the main dashboard area without leaving the app.
    switch (currentPage) {
      case 'progress':
        return <MyProgressPage user={user} />
      case 'classes':
        return <ClassesPage user={user} />
      case 'quizzes':
        return <QuizzesPage user={user} />
      case 'vocabulary':
        return <VocabularyPage user={user} />
      case 'achievements':
        return <AchievementsPage user={user} />
      case 'resources':
        return <ResourcesPage user={user} />
      case 'profile':
        return <ProfilePage user={user} />
      case 'settings':
        return <SettingsPage user={user} />
      case 'help':
        return <HelpPage user={user} />
      default:
        // Home page
        return (
          <div className="dashboard-home">
            {/* Hero Background */}
            <div className="hero-background">
              <img src="/images/hero.jpeg" alt="Hero" />
              <div className="hero-overlay"></div>
            </div>
            
            <div className="dashboard-header">
              <div className="welcome-section">
                <h1>Welcome back, {userName}!</h1>
                <p>Continue your {selectedLanguage === 'luganda' ? 'Luganda' : 'Runyankole'} learning journey</p>
              </div>
              
              <div className="progress-overview">
                <div className="progress-stat">
                  <span className="stat-label">Overall Progress</span>
                  <div className="stat-value">
                    <span className="stat-number">{progressMetrics.overallProgress}%</span>
                    <div className="progress-bar-small">
                      <div className="progress-fill" style={{ width: `${progressMetrics.overallProgress}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="progress-stat">
                  <span className="stat-label">Current Streak</span>
                  <div className="stat-value">
                    <span className="stat-number">{progressMetrics.streak} {progressMetrics.streak === 1 ? 'day' : 'days'}</span>
                  </div>
                </div>
                <div className="progress-stat">
                  <span className="stat-label">Quiz Average</span>
                  <div className="stat-value">
                    <span className="stat-number">{progressMetrics.quizCount > 0 ? `${progressMetrics.avgQuizScore}%` : '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <LevelLadder onWeekClick={handleWeekClick} selectedLanguage={selectedLanguage} />
          </div>
        )
    }
  }

  return (
    <div className="dashboard">
      <Sidebar 
        expanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      <main className={`dashboard-main ${!sidebarExpanded ? 'sidebar-collapsed' : ''}`}>
        {renderPageContent()}
      </main>

      <ChatbotDock isOpen={chatbotOpen} onToggle={() => setChatbotOpen(!chatbotOpen)} />

      {selectedWeek && (
        <WeekModal week={selectedWeek} onClose={closeWeekModal} />
      )}
    </div>
  )
}

export default Dashboard
