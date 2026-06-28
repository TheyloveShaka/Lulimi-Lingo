import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2, Play, Star } from 'lucide-react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useLearning } from '../../context/LearningContext'
import './LevelLadder.css'
import curriculumData from '../../data/curriculumData'

const LevelLadder = ({ onWeekClick }) => {
  const { getWeekProgress, isWeekUnlocked, isWeekComplete } = useLearning()
  const [selectedClass, setSelectedClass] = useState('S1')
  const [selectedTerm, setSelectedTerm] = useState('Term1')
  const containerRef = useRef(null)
  const nodeRefs = useRef([])
  const [paths, setPaths] = useState([])

  const getBadgeText = (title) => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
    const maxLength = viewportWidth < 380 ? 12 : viewportWidth < 480 ? 16 : viewportWidth < 768 ? 20 : 26

    if (!title || title.length <= maxLength) return title
    return `${title.slice(0, maxLength).trimEnd()}...`
  }

  const currentClass = curriculumData[selectedClass]
  const currentTerm = currentClass.terms[selectedTerm]

  // Order every week in the class so unlocking is a continuous chain across terms.
  const orderedWeekIds = useMemo(
    () => Object.values(currentClass.terms)
      .flatMap((term) => term.weeks)
      .sort((a, b) => a.id - b.id)
      .map((w) => w.id),
    [selectedClass]
  )

  // One node per week (a "level"). Progress and lock state are REAL — derived from
  // the learner's completed lessons/quizzes, never from static placeholder values.
  const nextWeekId = useMemo(() => {
    for (const id of orderedWeekIds) {
      if (isWeekUnlocked(orderedWeekIds, id) && !isWeekComplete(id)) return id
    }
    return null
  }, [orderedWeekIds, isWeekUnlocked, isWeekComplete])

  const topics = currentTerm.weeks.map((week) => {
    const progress = getWeekProgress(week.id)
    const locked = !isWeekUnlocked(orderedWeekIds, week.id)
    return {
      id: `week-${week.id}`,
      topicTitle: week.title,
      weekTitle: `Week ${week.number} • ${week.topics.length} topics`,
      progress,
      locked,
      isNext: week.id === nextWeekId,
      originalWeek: week
    }
  })

  const completedCount = currentTerm.weeks.filter((w) => isWeekComplete(w.id)).length

  // Initialize refs array
  useEffect(() => {
    nodeRefs.current = nodeRefs.current.slice(0, topics.length)
  }, [topics.length])

  // Constants for precise calculations
  const CIRCLE_RADIUS = 80 // 160px diameter / 2

  // The SVG connector lines are drawn from the node positions after render.
  useEffect(() => {
    const updateAllPaths = () => {
      const topicsContainer = containerRef.current?.querySelector('.topics-container')
      if (!topicsContainer || nodeRefs.current.length < 2) return

      const containerRect = topicsContainer.getBoundingClientRect()
      const newPaths = []

      for (let i = 1; i < nodeRefs.current.length; i++) {
        const prevNode = nodeRefs.current[i - 1]
        const currentNode = nodeRefs.current[i]
        
        if (!prevNode || !currentNode) continue

        const prevRect = prevNode.getBoundingClientRect()
        const currentRect = currentNode.getBoundingClientRect()

        // Measure both nodes relative to the ladder container.
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

        // The curved path gives the ladder a game-like, guided feel.
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
  }, [topics.length])

  const TopicNode = ({ item, index }) => {
    const isLeftSide = index % 2 === 0
    const delay = index * 0.08

    return (
      <motion.div
        className={`topic-node-container ${isLeftSide ? 'left' : 'right'}`}
        initial={{ opacity: 1, x: isLeftSide ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        {/* Each node represents one week (level) in the syllabus. */}
        <motion.button
          ref={(el) => (nodeRefs.current[index] = el)}
          className={`topic-node ${item.locked ? 'locked' : ''} ${item.progress === 100 ? 'completed' : ''} ${item.progress > 0 && item.progress < 100 ? 'in-progress' : ''} ${item.isNext ? 'next' : ''}`}
          onClick={() => !item.locked && onWeekClick(item.originalWeek)}
          whileHover={!item.locked ? { scale: 1.08, y: -4 } : {}}
          whileTap={!item.locked ? { scale: 0.95 } : {}}
          animate={item.isNext ? { y: [0, -8, 0] } : { y: 0 }}
          transition={item.isNext ? { y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } } : { duration: 0.2 }}
          disabled={item.locked}
        >
          {/* "Start here" pointer guides the learner to their next level. */}
          {item.isNext && <span className="next-badge">Start here</span>}

          {/* Progress ring shows completion status at a glance. */}
          <div className="progress-ring">
            <CircularProgressbar
              value={item.progress}
              strokeWidth={6}
              styles={buildStyles({
                pathColor: item.progress === 100 ? '#10b981' : item.locked ? '#cbd5e1' : '#6b9fff',
                trailColor: 'rgba(229, 231, 235, 0.4)',
                pathTransitionDuration: 0.6,
              })}
            />
          </div>

          {/* The icon hints whether the level is locked, new, active, or complete. */}
          <div className="node-icon">
            {item.locked && <Lock size={26} />}
            {!item.locked && item.progress === 100 && <CheckCircle2 size={26} />}
            {!item.locked && item.progress > 0 && item.progress < 100 && <Play size={26} />}
            {!item.locked && item.progress === 0 && <Star size={26} />}
          </div>

          {/* Short labels keep the ladder readable on small screens. */}
          <div className="topic-badge">
            <span className="topic-title">{getBadgeText(item.topicTitle)}</span>
          </div>
        </motion.button>

        {/* Tooltip gives the full topic name and completion percentage. */}
        <motion.div
          className="topic-tooltip"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
        >
          <h4>{item.topicTitle}</h4>
          <p className="week-context">{item.weekTitle}</p>
          {item.locked ? (
            <p className="tooltip-locked">🔒 Finish the previous level to unlock</p>
          ) : (
            <div className="tooltip-progress">
              <div className="progress-bar-tooltip">
                <div className="progress-fill-tooltip" style={{ width: `${item.progress}%` }}></div>
              </div>
              <span>{item.progress}% Complete</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="level-ladder">
      {/* Class and term controls let learners jump to the right syllabus segment. */}
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

      {/* The ladder path is the visual map of progression through the course. */}
      <div className="ladder-path" ref={containerRef} style={{ position: 'relative' }}>
        <div className="ladder-header">
          <h2>{currentClass.name} - {currentTerm.name}</h2>
          <p>Finish a level to unlock the next one</p>
          <div className="ladder-progress-summary">
            <div className="ladder-progress-track">
              <motion.div
                className="ladder-progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${currentTerm.weeks.length ? (completedCount / currentTerm.weeks.length) * 100 : 0}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span>{completedCount}/{currentTerm.weeks.length} levels complete</span>
          </div>
        </div>

        <div className="topics-container">
          {/* SVG overlay for all connecting paths */}
          {paths.length > 0 && (
            <svg
              className="connecting-svg"
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
                  {topics.map((_, idx) => {
                    const node = nodeRefs.current[idx]
                    if (!node) return null
                    const topicsContainer = containerRef.current?.querySelector('.topics-container')
                    if (!topicsContainer) return null
                    const containerRect = topicsContainer.getBoundingClientRect()
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
                    transition={{ duration: 0.8, delay: index * 0.08 + 0.2 }}
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
                      delay: index * 0.08 + 1
                    }}
                    opacity={0.8}
                  />
                </g>
              ))}
            </svg>
          )}
          
          {topics.map((item, index) => (
            <TopicNode 
              key={item.id} 
              item={item} 
              index={index}
            />
          ))}
        </div>

        {/* Finish Line */}
        <motion.div
          className="finish-line"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: topics.length * 0.08 }}
        >
          <div className="finish-flag">
            <Star size={32} />
            <h3>Term Complete!</h3>
            <p>Excellent! You've mastered all topics for this term.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LevelLadder
