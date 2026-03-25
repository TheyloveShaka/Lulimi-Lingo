/**
 * LessonView Component
 * 
 * Displays AI-generated lessons with structured content including
 * introduction, explanation, examples, and cultural notes.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  ChevronRight, 
  Volume2,
  Lightbulb,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { generateLesson } from '../../services/aiService';
import { useLearning } from '../../context/LearningContext';
import './LessonView.css';

const LessonView = ({ topic, onComplete, onStartPractice }) => {
  const { getSyllabusContext, completeLesson } = useLearning();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionsCompleted, setSectionsCompleted] = useState([]);

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: BookOpen },
    { id: 'explanation', title: 'Concept', icon: Lightbulb },
    { id: 'examples', title: 'Examples', icon: MessageCircle },
    { id: 'culturalNote', title: 'Cultural Note', icon: Volume2 }
  ];

  useEffect(() => {
    loadLesson();
  }, [topic]);

  const loadLesson = async () => {
    setLoading(true);
    setError(null);

    const context = getSyllabusContext();
    
    try {
      const result = await generateLesson({
        classLevel: context.class,
        term: `Term ${context.term}`,
        week: `Week ${context.week}`,
        topic: topic?.title || topic?.topics?.[0] || context.weekData?.topic || 'Language Lesson',
        objectives: topic?.objectives || context.weekData?.objectives || []
      });

      if (result.success) {
        setLesson(result.lesson || { raw: result.raw });
      } else {
        setError(result.error || 'Failed to generate lesson');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionComplete = (sectionIndex) => {
    if (!sectionsCompleted.includes(sectionIndex)) {
      setSectionsCompleted([...sectionsCompleted, sectionIndex]);
    }
    
    if (sectionIndex < sections.length - 1) {
      setCurrentSection(sectionIndex + 1);
    }
  };

  const handleLessonComplete = () => {
    completeLesson(topic?.id || topic);
    onComplete?.();
  };

  const allSectionsComplete = sectionsCompleted.length >= sections.length - 1;

  if (loading) {
    return (
      <div className="lesson-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={32} />
        </motion.div>
        <p>Preparing your lesson...</p>
        <span className="loading-hint">Our AI teacher is creating personalized content for you</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-error">
        <p>😔 {error}</p>
        <button onClick={loadLesson} className="retry-btn">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-view">
      {/* Lesson Header */}
      <div className="lesson-header">
        <div className="lesson-title">
          <BookOpen className="lesson-icon" />
          <div>
            <h2>{topic?.title || 'Lesson'}</h2>
            <span className="lesson-subtitle">📘 Lesson Mode</span>
          </div>
        </div>
        <div className="lesson-progress">
          <div className="progress-dots">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                className={`progress-dot ${currentSection === index ? 'active' : ''} ${sectionsCompleted.includes(index) ? 'completed' : ''}`}
                whileHover={{ scale: 1.2 }}
                onClick={() => setCurrentSection(index)}
              />
            ))}
          </div>
          <span>{sectionsCompleted.length}/{sections.length} sections</span>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="section-tabs">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              className={`section-tab ${currentSection === index ? 'active' : ''} ${sectionsCompleted.includes(index) ? 'completed' : ''}`}
              onClick={() => setCurrentSection(index)}
            >
              <Icon size={16} />
              <span>{section.title}</span>
              {sectionsCompleted.includes(index) && <CheckCircle size={14} className="check-icon" />}
            </button>
          );
        })}
      </div>

      {/* Lesson Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          className="lesson-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentSection === 0 && (
            <div className="section-content introduction">
              <h3>🎯 Introduction</h3>
              <div className="content-text">
                {lesson?.introduction || lesson?.raw?.split('\n\n')[0] || 'Welcome to this lesson!'}
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="section-content explanation">
              <h3>💡 Concept Explanation</h3>
              <div className="content-text">
                {lesson?.explanation || lesson?.raw?.split('\n\n')[1] || 'Understanding the concept...'}
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="section-content examples">
              <h3>📝 Examples</h3>
              <div className="examples-list">
                {(lesson?.examples || []).length > 0 ? (
                  lesson.examples.map((example, index) => (
                    <motion.div
                      key={index}
                      className="example-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="example-number">{index + 1}</span>
                      <div className="example-content">
                        <p className="luganda-text">{example.split(' - ')[0] || example}</p>
                        <p className="english-text">{example.split(' - ')[1] || ''}</p>
                      </div>
                      <button className="audio-btn" title="Listen">
                        <Volume2 size={16} />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="content-text">
                    {lesson?.raw?.split('**Examples**')[1]?.split('**')[0] || 'Examples will appear here...'}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="section-content cultural-note">
              <h3>🌍 Cultural Note</h3>
              <div className="cultural-card">
                <div className="cultural-icon">🇺🇬</div>
                <div className="content-text">
                  {lesson?.culturalNote || lesson?.raw?.split('Cultural Note')[1] || 'Cultural context helps you understand how the language is used in real life.'}
                </div>
              </div>
            </div>
          )}

          {/* Section Actions */}
          <div className="section-actions">
            {currentSection > 0 && (
              <button 
                className="nav-btn prev"
                onClick={() => setCurrentSection(currentSection - 1)}
              >
                ← Previous
              </button>
            )}
            
            {currentSection < sections.length - 1 ? (
              <button 
                className="nav-btn next"
                onClick={() => handleSectionComplete(currentSection)}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                className="nav-btn complete"
                onClick={() => handleSectionComplete(currentSection)}
              >
                <CheckCircle size={16} /> Complete Section
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Lesson Footer */}
      {allSectionsComplete && (
        <motion.div 
          className="lesson-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="completion-message">
            <span className="celebration">🎉</span>
            <h3>Lesson Complete!</h3>
            <p>Great job! You've finished this lesson. Ready to practice?</p>
          </div>
          <div className="footer-actions">
            <button className="action-btn secondary" onClick={loadLesson}>
              <RefreshCw size={16} /> Review Again
            </button>
            <button className="action-btn primary" onClick={onStartPractice}>
              <Play size={16} /> Start Practice
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LessonView;
