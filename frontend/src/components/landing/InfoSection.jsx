import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Brain, Trophy, Globe, Sparkles, Award } from 'lucide-react'
import './InfoSection.css'

const InfoSection = () => {
  const howItWorks = [
    {
      icon: <BookOpen size={32} />,
      title: 'Choose Your Class',
      description: 'Select your current class level (S1-S4) and start with curriculum-aligned content'
    },
    {
      icon: <Brain size={32} />,
      title: 'Learn with AI',
      description: 'Our AI adapts to your pace, providing personalized lessons and instant feedback'
    },
    {
      icon: <Trophy size={32} />,
      title: 'Track Progress',
      description: 'Complete quizzes, earn achievements, and watch your language skills grow'
    }
  ]

  const benefits = [
    {
      icon: <Globe size={40} />,
      title: 'Cultural Connection',
      description: 'Connect with your roots and preserve Uganda\'s rich linguistic heritage'
    },
    {
      icon: <Award size={40} />,
      title: 'Exam Success',
      description: 'Curriculum-aligned content ensures you\'re prepared for school assessments'
    },
    {
      icon: <Sparkles size={40} />,
      title: 'Identity & Pride',
      description: 'Build confidence in your cultural identity through language mastery'
    }
  ]

  return (
    <div className="info-section">
      {/* How It Works */}
      <section className="how-it-works">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>How It Works</h2>
          <p>Get started in three simple steps</p>
        </motion.div>

        <div className="steps-grid">
          {howItWorks.map((step, index) => (
            <motion.div
              key={index}
              className="step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Learn */}
      <section className="why-learn">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Why Learn Local Languages?</h2>
          <p>More than just words — it's about identity and success</p>
        </motion.div>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="benefit-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Powered Highlight */}
      <section className="ai-highlight">
        <motion.div
          className="highlight-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="highlight-text">
            <div className="badge">
              <Brain size={20} />
              <span>AI-Powered</span>
            </div>
            <h2>Smart Learning, Real Results</h2>
            <p>
              Our advanced AI technology creates personalized learning paths, 
              generates custom quizzes, and provides instant feedback. 
              Experience education that adapts to you.
            </p>
            <ul className="feature-list">
              <li>✨ Adaptive difficulty levels</li>
              <li>✨ Real-time pronunciation feedback</li>
              <li>✨ Personalized practice recommendations</li>
              <li>✨ Smart progress tracking</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div className="ai-orb">
              <motion.div
                className="orb-ring"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="orb-core"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain size={48} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Curriculum Badge */}
      <section className="curriculum-badge-section">
        <motion.div
          className="badge-container"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge-icon">
            <Award size={48} />
          </div>
          <h3>Uganda Syllabus Compliant</h3>
          <p>Fully aligned with the National Curriculum Development Centre (NCDC) standards</p>
          <div className="badge-seal">
            <span>✓ Certified Content</span>
            <span>✓ S1-S4 Coverage</span>
            <span>✓ Exam Focused</span>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default InfoSection
