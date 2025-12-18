import { motion } from 'framer-motion'
import { Book, Clock, Target, ChevronRight, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { curriculumData } from '../data/curriculumData'
import './CurriculumPage.css'

const CurriculumPage = () => {
  const navigate = useNavigate()

  const classes = Object.keys(curriculumData)

  return (
    <div className="curriculum-page">
      <motion.button
        className="back-button"
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </motion.button>

      <motion.div
        className="curriculum-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Course Curriculum</h1>
        <p>Complete learning path for Uganda's local languages - S1 through S4</p>
      </motion.div>

      <div className="curriculum-grid">
        {classes.map((classKey, index) => {
          const classData = curriculumData[classKey]
          const totalWeeks = Object.values(classData.terms).reduce(
            (sum, term) => sum + term.weeks.length,
            0
          )

          return (
            <motion.div
              key={classKey}
              className="class-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="class-header">
                <div className="class-icon">
                  <Book size={32} />
                </div>
                <div className="class-info">
                  <h2>{classData.name}</h2>
                  <p className="class-description">{classData.description}</p>
                </div>
              </div>

              <div className="class-stats">
                <div className="stat">
                  <Clock size={18} />
                  <span>{totalWeeks} weeks</span>
                </div>
                <div className="stat">
                  <Target size={18} />
                  <span>{Object.keys(classData.terms).length} terms</span>
                </div>
              </div>

              <div className="terms-list">
                {Object.entries(classData.terms).map(([termKey, termData]) => (
                  <div key={termKey} className="term-section">
                    <h3 className="term-title">{termData.name}</h3>
                    <div className="weeks-preview">
                      {termData.weeks.slice(0, 3).map((week) => (
                        <div key={week.id} className="week-item">
                          <ChevronRight size={16} />
                          <span>Week {week.number}: {week.title}</span>
                        </div>
                      ))}
                      {termData.weeks.length > 3 && (
                        <div className="week-item more">
                          <span>+ {termData.weeks.length - 3} more weeks</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                className="view-details-btn"
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Learning
              </motion.button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default CurriculumPage
