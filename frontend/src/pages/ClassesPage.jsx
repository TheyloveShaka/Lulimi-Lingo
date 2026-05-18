import React, { useState, useMemo } from 'react'
import { BookOpen, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { curriculumData } from '../data/curriculumData'
import './ClassesPage.css'

const ClassesPage = ({ user }) => {
  const classOrder = ['S1', 'S2', 'S3', 'S4']
  const termOrder = ['Term1', 'Term2', 'Term3']
  const [selectedClass, setSelectedClass] = useState('S1')
  const [selectedTerm, setSelectedTerm] = useState('Term1')

  const orderedClasses = useMemo(
    () => classOrder.filter((classKey) => curriculumData[classKey]),
    []
  )

  const classData = curriculumData[selectedClass]
  const termData = classData?.terms?.[selectedTerm]
  const weeks = termData?.weeks || []

  const handleSelectClass = (classKey) => {
    setSelectedClass(classKey)
    setSelectedTerm('Term1')
  }

  return (
    <div className="classes-page">
      <div className="classes-header">
        <h1>My Classes</h1>
        <p>Explore the full path from S1 to S4, arranged by term for easier navigation.</p>
      </div>

      <div className="classes-container">
        {/* Classes List */}
        <div className="classes-list">
          {orderedClasses.map((classKey, idx) => {
            const currentClass = curriculumData[classKey]
            const totalTerms = Object.keys(currentClass.terms || {}).length
            const totalWeeks = Object.values(currentClass.terms || {}).reduce(
              (sum, term) => sum + (term.weeks?.length || 0),
              0
            )

            return (
              <motion.div
                key={classKey}
                className={`class-card ${selectedClass === classKey ? 'active' : ''}`}
                onClick={() => handleSelectClass(classKey)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="class-header-info">
                  <h3>{classKey}</h3>
                  <p>{currentClass.name}</p>
                </div>
                <div className="class-progress-mini">
                  <div className="class-meta-row">
                    <span>{totalWeeks} weeks</span>
                    <span>{totalTerms} terms</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Class Details */}
        {classData && (
          <motion.div
            className="lessons-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="class-detail-header">
              <div>
                <h2>{classData.name}</h2>
                <p>{classData.description}</p>
              </div>
              <div className="term-tabs">
                {termOrder.map((termKey) => (
                  <button
                    key={termKey}
                    className={`term-tab ${selectedTerm === termKey ? 'active' : ''}`}
                    onClick={() => setSelectedTerm(termKey)}
                  >
                    {classData.terms[termKey]?.name || termKey.replace('Term', 'Term ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="term-overview">
              <h3>{classData.terms[selectedTerm]?.name}</h3>
              <p>{classData.terms[selectedTerm]?.weeks?.length || 0} weeks available in this term</p>
            </div>

            <div className="lessons-grid term-weeks-grid">
              {weeks.map((week, idx) => (
                <motion.div
                  key={week.id}
                  className="lesson-card term-week-card"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="lesson-status">
                    {week.progress >= 100 ? (
                      <CheckCircle2 size={24} className="completed-icon" />
                    ) : (
                      <BookOpen size={24} className="pending-icon" />
                    )}
                  </div>
                  <h4>Week {week.number}</h4>
                  <p className="week-title">{week.title}</p>
                  <div className="lesson-meta">
                    <span className="lesson-duration">
                      <Clock size={14} />
                      {week.estimatedHours} hrs
                    </span>
                  </div>
                  <div className="week-topics">
                    {(week.topics || []).slice(0, 3).map((topic) => (
                      <span key={topic} className="week-topic-chip">{topic}</span>
                    ))}
                  </div>
                  <button className="btn-start">Open Week <ChevronRight size={16} /></button>
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
