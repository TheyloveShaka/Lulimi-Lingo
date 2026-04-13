import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, TrendingUp, BookOpen, Brain, Trophy, 
  BookMarked, Award, Settings, HelpCircle, User,
  ChevronLeft, ChevronRight, Sparkles, LogOut, Menu, X
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ expanded, onToggle, currentPage, onPageChange }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      // Auto-collapse sidebar on mobile
      if (mobile && expanded) {
        onToggle()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [expanded, onToggle])
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
    { id: 'logout', label: 'Logout', icon: <LogOut size={22} />, isLogout: true },
  ]

  const handleMenuClick = (itemId, isLogout) => {
    // Close mobile menu after selection
    if (isMobile) {
      setMobileMenuOpen(false)
    }
    
    if (isLogout) {
      // Clear user session with correct localStorage keys
      localStorage.removeItem('authToken')
      localStorage.removeItem('lulimiLingoCurrentUser')
      // Reload page to reset auth state
      window.location.href = '/'
    } else {
      onPageChange(itemId)
    }
  }

  // Mobile hamburger menu handler
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <motion.div
          className="mobile-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${expanded ? 'expanded' : 'collapsed'} ${isMobile && mobileMenuOpen ? 'mobile-open' : ''}`}
        animate={{ 
          width: isMobile ? (mobileMenuOpen ? 280 : 0) : (expanded ? 280 : 80),
          x: isMobile && mobileMenuOpen ? 0 : 0
        }}
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
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.id)}
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
                className={`nav-item ${currentPage === item.id ? 'active' : ''} ${item.isLogout ? 'logout-btn' : ''}`}
                onClick={() => handleMenuClick(item.id, item.isLogout)}
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
    </>
  )
}

export default Sidebar
