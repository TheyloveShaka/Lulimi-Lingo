import React, { useState, useEffect } from 'react'
import { BookOpen, Clock, CheckCircle2, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import './ClassesPage.css'

const ClassesPage = ({ user }) => {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)

  useEffect(() => {
    // Mock data
    const mockClasses = [
      {
        id: 1,
        week: 1,
        title: 'Luganda Basics & Greetings',
        lessons: [
          { id: 'L1', title: 'Introduction to Luganda', completed: true, duration: '15 min' },
          { id: 'L2', title: 'Common Greetings', completed: true, duration: '12 min' },
          { id: 'L3', title: 'Polite Expressions', completed: false, duration: '18 min' },
          { id: 'L4', title: 'Numbers 1-10', completed: false, duration: '20 min' }
        ],
        progress: 50
      },
      {
        id: 2,
        week: 2,
        title: 'Family & Daily Life',
        lessons: [
          { id: 'L5', title: 'Family Members', completed: true, duration: '15 min' },
          { id: 'L6', title: 'Daily Activities', completed: true, duration: '17 min' },
          { id: 'L7', title: 'Food & Drinks', completed: false, duration: '19 min' },
          { id: 'L8', title: 'Time & Routines', completed: false, duration: '21 min' }
        ],
        progress: 50
      },
      {
        id: 3,
        week: 3,
        title: 'Grammar Fundamentals',
        lessons: [
          { id: 'L9', title: 'Articles & Nouns', disabled: true, duration: '20 min' },
          { id: 'L10', title: 'Verbs & Tenses', disabled: true, duration: '22 min' },
          { id: 'L11', title: 'Adjectives', disabled: true, duration: '18 min' },
          { id: 'L12', title: 'Pronouns', disabled: true, duration: '16 min' }
        ],
        progress: 0
      }
    ]
    setClasses(mockClasses)
    setSelectedClass(mockClasses[0])
  }, [])

  return (
    <div className="classes-page">
      <div className="classes-header">
        <h1>My Classes</h1>
        <p>Track your lessons and continue learning</p>
      </div>

      <div className="classes-container">
        {/* Classes List */}
        <div className="classes-list">
          {classes.map((cls, idx) => (
            <motion.div
              key={cls.id}
              className={`class-card ${selectedClass?.id === cls.id ? 'active' : ''}`}
              onClick={() => setSelectedClass(cls)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="class-header-info">
                <h3>Week {cls.week}</h3>
                <p>{cls.title}</p>
              </div>
              <div className="class-progress-mini">
                <div className="progress-bar-mini">
                  <div className="progress-fill" style={{ width: `${cls.progress}%` }}></div>
                </div>
                <span className="progress-text">{cls.progress}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lessons Details */}
        {selectedClass && (
          <motion.div
            className="lessons-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>{selectedClass.title}</h2>
            <div className="lessons-grid">
              {selectedClass.lessons.map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  className={`lesson-card ${lesson.completed ? 'completed' : ''} ${lesson.disabled ? 'disabled' : ''}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={!lesson.disabled ? { scale: 1.05 } : {}}
                >
                  <div className="lesson-status">
                    {lesson.completed ? (
                      <CheckCircle2 size={24} className="completed-icon" />
                    ) : lesson.disabled ? (
                      <Lock size={24} className="disabled-icon" />
                    ) : (
                      <BookOpen size={24} className="pending-icon" />
                    )}
                  </div>
                  <h4>{lesson.title}</h4>
                  <div className="lesson-meta">
                    <span className="lesson-duration">
                      <Clock size={14} />
                      {lesson.duration}
                    </span>
                  </div>
                  {!lesson.disabled && !lesson.completed && (
                    <button className="btn-start">Start Lesson</button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ClassesPage
