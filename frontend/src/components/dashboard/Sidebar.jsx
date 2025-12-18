import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, TrendingUp, BookOpen, Brain, Trophy, 
  BookMarked, Award, Settings, HelpCircle, User,
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ expanded, onToggle }) => {
  const [activePage, setActivePage] = useState('home')

  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={22} /> },
    { id: 'progress', label: 'My Progress', icon: <TrendingUp size={22} /> },
    { id: 'classes', label: 'Classes', icon: <BookOpen size={22} /> },
    { id: 'quizzes', label: 'Quizzes', icon: <Brain size={22} /> },
    { id: 'vocabulary', label: 'Vocabulary Bank', icon: <BookMarked size={22} /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={22} /> },
    { id: 'resources', label: 'Resources', icon: <Award size={22} /> },
  ]

  const bottomItems = [
    { id: 'profile', label: 'Profile', icon: <User size={22} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={22} /> },
    { id: 'help', label: 'Help', icon: <HelpCircle size={22} /> },
  ]

  return (
    <motion.aside
      className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}
      animate={{ width: expanded ? 280 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="sidebar-content">
        {/* Header */}
        <div className="sidebar-header">
          <AnimatePresence mode="wait">
            {expanded ? (
              <motion.div
                key="expanded-logo"
                className="logo-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="logo-icon">
                  <Sparkles size={28} />
                </div>
                <div className="logo-text">
                  <span className="logo-title">Lulimi Lingo</span>
                  <span className="logo-subtitle">Speak Your Roots</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                className="logo-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sparkles size={28} />
              </motion.div>
            )}
          </AnimatePresence>

          <button className="toggle-btn" onClick={onToggle}>
            {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Main Menu */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="nav-icon">{item.icon}</span>
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      className="nav-label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Bottom Menu */}
          <div className="nav-section nav-bottom">
            {bottomItems.map((item) => (
              <motion.button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="nav-icon">{item.icon}</span>
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      className="nav-label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </nav>
      </div>
    </motion.aside>
  )
}

export default Sidebar
