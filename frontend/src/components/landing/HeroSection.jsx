import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Brain, Target, Users, ChevronDown, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './HeroSection.css'

const HeroSection = ({ onGetStarted }) => {
  const navigate = useNavigate()
  const floatingShapes = [
    { id: 1, size: 80, color: '#667eea', delay: 0 },
    { id: 2, size: 120, color: '#f093fb', delay: 2 },
    { id: 3, size: 60, color: '#4facfe', delay: 4 },
    { id: 4, size: 100, color: '#fa709a', delay: 1.5 },
    { id: 5, size: 70, color: '#fee140', delay: 3 },
  ]

  return (
    <section className="hero-section">
      {/* Decorative shapes add motion without competing with the call to action. */}
      <div className="floating-shapes">
        {floatingShapes.map((shape) => (
          <motion.div
            key={shape.id}
            className="shape"
            style={{
              width: shape.size,
              height: shape.size,
              backgroundColor: shape.color,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 360],
            }}
            transition={{
              duration: 6 + shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: shape.delay,
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        {/* The main message explains what the app is before asking the user to act. */}
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="hero-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Sparkles size={16} />
            <span>AI-Powered Learning</span>
          </motion.div>

          <h1 className="hero-title">
            Lulimi Lingo
            <span className="gradient-text"> - Speak Your Roots</span>
          </h1>

          <p className="hero-subtitle">
            Master Luganda, Runyankole, and more through gamified lessons, 
            AI-powered quizzes, and a curriculum aligned with Uganda's education system.
          </p>

          <div className="hero-features">
            <div className="feature-pill">
              <Brain size={20} />
              <span>AI-Powered</span>
            </div>
            <div className="feature-pill">
              <Trophy size={20} />
              <span>Gamified</span>
            </div>
            <div className="feature-pill">
              <Sparkles size={20} />
              <span>Interactive</span>
            </div>
          </div>

          <div className="hero-classes">
            <div className="classes-label">
              <Target size={18} />
              <span>Classes Covered</span>
            </div>
            <div className="class-pills">
              {['S1', 'S2', 'S3', 'S4'].map((level) => (
                <span key={level} className="class-pill">{level}</span>
              ))}
            </div>
          </div>

          {/* The two CTAs split first-time users from people who want the syllabus directly. */}
          <div className="hero-cta">
            <motion.button
              className="btn btn-primary"
              onClick={onGetStarted}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.6)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
            <motion.button
              className="btn btn-secondary"
              onClick={() => navigate('/curriculum')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Curriculum
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="hero-illustration"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="illustration-container">
            {/* SVG Illustration Placeholder */}
            <svg viewBox="0 0 500 500" className="hero-svg">
              {/* Student Character */}
              <circle cx="250" cy="200" r="60" fill="#667eea" opacity="0.2" />
              <circle cx="250" cy="200" r="50" fill="#667eea" />
              
              {/* Language Bubbles - 30% bigger */}
              <motion.g
                animate={{ y: [-6.5, 6.5, -6.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ellipse cx="150" cy="150" rx="58" ry="45" fill="#a78bfa" opacity="0.9" />
                <text x="150" y="158" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
                  Tugende
                </text>
              </motion.g>
              
              <motion.g
                animate={{ y: [6.5, -6.5, 6.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <ellipse cx="350" cy="170" rx="52" ry="39" fill="#6b9fff" opacity="0.9" />
                <text x="350" y="178" textAnchor="middle" fill="white" fontSize="15" fontWeight="600">
                  Ruhanga
                </text>
              </motion.g>
              
              <motion.g
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3.5, repeat: Infinity }}
              >
                <circle cx="320" cy="280" r="32" fill="#ffffff" opacity="0.95" />
                <path d="M 312 272 L 328 272 M 320 264 L 320 288 M 312 280 L 308 284 L 312 288 M 328 280 L 332 284 L 328 288" stroke="#6b9fff" strokeWidth="2.5" fill="none" />
              </motion.g>
              
              <motion.g
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 2.8, repeat: Infinity }}
              >
                <circle cx="180" cy="260" r="28" fill="#fee140" opacity="0.9" />
                <text x="180" y="268" textAnchor="middle" fill="#374151" fontSize="18" fontWeight="bold">
                  Ŋ
                </text>
              </motion.g>
              
              {/* Books/Resources */}
              <rect x="200" y="320" width="100" height="80" rx="10" fill="#10b981" opacity="0.8" />
              <rect x="210" y="330" width="80" height="5" fill="white" opacity="0.5" />
              <rect x="210" y="345" width="60" height="5" fill="white" opacity="0.5" />
              <rect x="210" y="360" width="70" height="5" fill="white" opacity="0.5" />
            </svg>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  )
}

export default HeroSection
