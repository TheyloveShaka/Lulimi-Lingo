import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2, Play, Star } from 'lucide-react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import './LevelLadder.css'
import curriculumData from '../../data/curriculumData'

const LevelLadder = ({ onWeekClick }) => {
  const [selectedClass, setSelectedClass] = useState('S1')
  const [selectedTerm, setSelectedTerm] = useState('Term1')
  const containerRef = useRef(null)
  const nodeRefs = useRef([])
  const [paths, setPaths] = useState([])

  const currentClass = curriculumData[selectedClass]
  const currentTerm = currentClass.terms[selectedTerm]

  // Initialize refs array
  useEffect(() => {
    nodeRefs.current = nodeRefs.current.slice(0, currentTerm.weeks.length)
  }, [currentTerm.weeks.length])

  // Constants for precise calculations
  const CIRCLE_RADIUS = 80 // 160px diameter / 2

  // Calculate all paths at once
  useEffect(() => {
    const updateAllPaths = () => {
      const weeksContainer = containerRef.current?.querySelector('.weeks-container')
      if (!weeksContainer || nodeRefs.current.length < 2) return

      const containerRect = weeksContainer.getBoundingClientRect()
      const newPaths = []

      for (let i = 1; i < nodeRefs.current.length; i++) {
        const prevNode = nodeRefs.current[i - 1]
        const currentNode = nodeRefs.current[i]
        
        if (!prevNode || !currentNode) continue

        const prevRect = prevNode.getBoundingClientRect()
        const currentRect = currentNode.getBoundingClientRect()

        // Calculate relative positions within weeks container
        const prevX = prevRect.left - containerRect.left + prevRect.width / 2
        const prevY = prevRect.top - containerRect.top + prevRect.height / 2
        const currentX = currentRect.left - containerRect.left + currentRect.width / 2
        const currentY = currentRect.top - containerRect.top + currentRect.height / 2

        // Calculate angle and distance
        const dx = currentX - prevX
        const dy = currentY - prevY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)
        
        // Start point: edge of previous circle
        const startX = prevX + Math.cos(angle) * CIRCLE_RADIUS
        const startY = prevY + Math.sin(angle) * CIRCLE_RADIUS
        
        // End point: edge of current circle
        const endX = currentX - Math.cos(angle) * CIRCLE_RADIUS
        const endY = currentY - Math.sin(angle) * CIRCLE_RADIUS

        // Create smooth wavy curve
        const perpAngle = angle + Math.PI / 2
        const waveOffset = Math.abs(dx) * 0.15
        
        const cp1X = startX + Math.cos(angle) * distance * 0.25 + Math.cos(perpAngle) * waveOffset
        const cp1Y = startY + Math.sin(angle) * distance * 0.25 + Math.sin(perpAngle) * waveOffset
        
        const cp2X = endX - Math.cos(angle) * distance * 0.25 - Math.cos(perpAngle) * waveOffset
        const cp2Y = endY - Math.sin(angle) * distance * 0.25 - Math.sin(perpAngle) * waveOffset

        const path = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`
        newPaths.push({ path, index: i })
      }

      setPaths(newPaths)
    }

    const timer = setTimeout(updateAllPaths, 200)
    window.addEventListener('resize', updateAllPaths)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateAllPaths)
    }
  }, [currentTerm.weeks.length])

  const WeekNode = ({ week, index }) => {
    const isLeftSide = index % 2 === 0
    const delay = index * 0.1

    return (
      <motion.div
        className={`week-node-container ${isLeftSide ? 'left' : 'right'}`}
        initial={{ opacity: 1, x: isLeftSide ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        {/* Week Node - 2x bigger with bounce */}
        <motion.button
          ref={(el) => (nodeRefs.current[index] = el)}
          className={`week-node ${week.locked ? 'locked' : ''} ${week.progress === 100 ? 'completed' : ''} ${week.progress > 0 && week.progress < 100 ? 'in-progress' : ''}`}
          onClick={() => !week.locked && onWeekClick(week)}
          whileHover={!week.locked ? { scale: 1.1, y: -5 } : {}}
          whileTap={!week.locked ? { scale: 0.95 } : {}}
          animate={{ y: [0, -8, 0], opacity: 1 }}
          transition={{ 
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0 }
          }}
          disabled={week.locked}
        >
          {/* Progress Ring */}
          <div className="progress-ring">
            <CircularProgressbar
              value={week.progress}
              strokeWidth={6}
              styles={buildStyles({
                pathColor: week.progress === 100 ? '#10b981' : '#6b9fff',
                trailColor: 'rgba(229, 231, 235, 0.3)',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>

          {/* Icon */}
          <div className="node-icon">
            {week.locked && <Lock size={26} />}
            {week.progress === 100 && <CheckCircle2 size={26} />}
            {week.progress > 0 && week.progress < 100 && <Play size={26} />}
            {week.progress === 0 && !week.locked && <Star size={26} />}
          </div>

          {/* Week Number Badge with Title */}
          <div className="week-badge">
            Week {week.id}
            <span className="week-subtitle">({week.title})</span>
          </div>
        </motion.button>

        {/* Tooltip */}
        <motion.div
          className="week-tooltip"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
        >
          <h4>{week.title}</h4>
          <div className="tooltip-topics">
            {week.topics.map((topic, i) => (
              <span key={i} className="topic-pill">• {topic}</span>
            ))}
          </div>
          <div className="tooltip-progress">
            <div className="progress-bar-tooltip">
              <div className="progress-fill-tooltip" style={{ width: `${week.progress}%` }}></div>
            </div>
            <span>{week.progress}% Complete</span>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="level-ladder">
      {/* Class & Term Selector */}
      <div className="ladder-controls">
        <div className="class-selector">
          <label>Select Class:</label>
          <div className="class-buttons">
            {Object.keys(curriculumData).map((classKey) => (
              <motion.button
                key={classKey}
                className={`class-btn ${selectedClass === classKey ? 'active' : ''}`}
                onClick={() => {
                  setSelectedClass(classKey)
                  setSelectedTerm('Term1')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {classKey}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="term-selector">
          <label>Select Term:</label>
          <div className="term-buttons">
            {Object.keys(currentClass.terms).map((termKey) => (
              <motion.button
                key={termKey}
                className={`term-btn ${selectedTerm === termKey ? 'active' : ''}`}
                onClick={() => setSelectedTerm(termKey)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentClass.terms[termKey].name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Ladder Path */}
      <div className="ladder-path" ref={containerRef} style={{ position: 'relative' }}>
        <div className="ladder-header">
          <h2>{currentClass.name} - {currentTerm.name}</h2>
          <p>Complete each week to unlock the next</p>
        </div>

        <div className="weeks-container">
          {/* SVG overlay for all connecting paths */}
          {paths.length > 0 && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
                overflow: 'visible'
              }}
            >
              <defs>
                <linearGradient id="gradient-static" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6b9fff" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
                <linearGradient id="gradient-pulse" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(107, 159, 255, 1)" />
                  <stop offset="50%" stopColor="rgba(167, 139, 250, 0.9)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.8)" />
                </linearGradient>
                {/* Create circular masks for each node */}
                <mask id="line-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {currentTerm.weeks.map((_, idx) => {
                    const node = nodeRefs.current[idx]
                    if (!node) return null
                    const weeksContainer = containerRef.current?.querySelector('.weeks-container')
                    if (!weeksContainer) return null
                    const containerRect = weeksContainer.getBoundingClientRect()
                    const nodeRect = node.getBoundingClientRect()
                    const cx = nodeRect.left - containerRect.left + nodeRect.width / 2
                    const cy = nodeRect.top - containerRect.top + nodeRect.height / 2
                    return <circle key={idx} cx={cx} cy={cy} r={CIRCLE_RADIUS} fill="black" />
                  })}
                </mask>
              </defs>
              {paths.map(({ path, index }) => (
                <g key={index} mask="url(#line-mask)">
                  {/* Main path - thicker */}
                  <motion.path
                    d={path}
                    stroke="url(#gradient-static)"
                    strokeWidth="18"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                  />
                  {/* Animated pulse - thicker */}
                  <motion.path
                    d={path}
                    stroke="url(#gradient-pulse)"
                    strokeWidth="28"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="50 200"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -250 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 0.1 + 1
                    }}
                    opacity={0.8}
                  />
                </g>
              ))}
            </svg>
          )}
          
          {currentTerm.weeks.map((week, index) => (
            <WeekNode 
              key={week.id} 
              week={week} 
              index={index}
            />
          ))}
        </div>

        {/* Finish Line */}
        <motion.div
          className="finish-line"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: currentTerm.weeks.length * 0.1 }}
        >
          <div className="finish-flag">
            <Star size={32} />
            <h3>Term Complete!</h3>
            <p>Great job! Ready for the next term?</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LevelLadder
