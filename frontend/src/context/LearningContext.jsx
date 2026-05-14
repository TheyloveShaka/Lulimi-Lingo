/**
 * Lulimi Lingo - Learning Context Provider
 * 
 * This context manages the learner's progress, current position in the syllabus,
 * and completed topics for AI scope control.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import syllabusContent from '../data/syllabusContent.json';

const LearningContext = createContext();

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

export const LearningProvider = ({ children }) => {
  // Current learning position
  const [currentClass, setCurrentClass] = useState('S1');
  const [currentTerm, setCurrentTerm] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentTopic, setCurrentTopic] = useState(null);
  // Selected UI/learning language
  const [language, setLanguage] = useState('luganda');

  // Learning progress
  const [completedTopics, setCompletedTopics] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [quizScores, setQuizScores] = useState({});
  const [practiceHistory, setPracticeHistory] = useState([]);

  // Mistake tracking for personalized learning
  const [commonMistakes, setCommonMistakes] = useState([]);
  const [proficiencyLevel, setProficiencyLevel] = useState('beginner');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState(null);

  // Current mode
  const [learningMode, setLearningMode] = useState('LESSON'); // LESSON, PRACTICE, QUIZ, OVERVIEW, TUTOR_CHAT

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('lulimiLingoProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCompletedTopics(progress.completedTopics || []);
      setCompletedLessons(progress.completedLessons || []);
      setQuizScores(progress.quizScores || {});
      setCommonMistakes(progress.commonMistakes || []);
      setProficiencyLevel(progress.proficiencyLevel || 'beginner');
      setCurrentClass(progress.currentClass || 'S1');
      setCurrentTerm(progress.currentTerm || 1);
      setCurrentWeek(progress.currentWeek || 1);
      setCurrentStreak(progress.currentStreak || 0);
      setLastActivityDate(progress.lastActivityDate || null);
      
      // Check if streak should reset (if last activity was yesterday or earlier)
      if (progress.lastActivityDate) {
        const lastDate = new Date(progress.lastActivityDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate.toDateString() === yesterday.toDateString()) {
          // Streak continues
        } else if (lastDate.toDateString() !== today.toDateString()) {
          // Reset streak if not today or yesterday
          setCurrentStreak(0);
        }
      }
    }
    // Load language/proficiency from current user profile if available
    try {
      const user = JSON.parse(localStorage.getItem('lulimiLingoCurrentUser') || 'null');
      if (user && user.language) setLanguage(user.language);
      if (user && user.proficiencyLevel) setProficiencyLevel(user.proficiencyLevel);
    } catch (e) {
      // ignore
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = () => {
    const progress = {
      completedTopics,
      completedLessons,
      quizScores,
      commonMistakes,
      proficiencyLevel,
      currentClass,
      currentTerm,
      currentWeek,
      currentStreak,
      lastActivityDate
    };
    localStorage.setItem('lulimiLingoProgress', JSON.stringify(progress));
  };

  // Update activity streak
  const updateActivityStreak = () => {
    const today = new Date().toDateString();
    const last = lastActivityDate ? new Date(lastActivityDate).toDateString() : null;
    
    if (last === today) {
      // Already have activity today
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (last === yesterday.toDateString()) {
      // Continue streak
      setCurrentStreak(currentStreak + 1);
    } else {
      // Reset streak
      setCurrentStreak(1);
    }
    
    setLastActivityDate(new Date().toISOString());
  };

  // Persist language to current user profile entry
  const persistLanguage = (lang) => {
    try {
      const user = JSON.parse(localStorage.getItem('lulimiLingoCurrentUser') || 'null');
      if (user) {
        user.language = lang;
        localStorage.setItem('lulimiLingoCurrentUser', JSON.stringify(user));
      }
    } catch (e) {
      // ignore
    }
  }

  const persistProficiency = (level) => {
    try {
      const user = JSON.parse(localStorage.getItem('lulimiLingoCurrentUser') || 'null');
      if (user) {
        user.proficiencyLevel = level;
        localStorage.setItem('lulimiLingoCurrentUser', JSON.stringify(user));
      }
    } catch (e) {
      // ignore
    }
  }

  // Auto-save progress when streak or activity changes
  useEffect(() => {
    saveProgress();
  }, [currentStreak, lastActivityDate]);

  // Get current week data from syllabus (array format)
  const getCurrentWeekData = () => {
    // syllabusContent is an array - find matching entry
    const entry = syllabusContent.find(s => 
      s.class === currentClass && 
      s.term === currentTerm
    );
    
    if (!entry) return null;

    // Parse week range to check if current week falls within it
    const weekRange = entry.week_range?.split('-').map(Number) || [1, 12];
    if (currentWeek >= weekRange[0] && currentWeek <= weekRange[1]) {
      return {
        topic: entry.topic,
        objectives: entry.objectives,
        vocabulary: entry.vocabulary,
        grammarFocus: entry.grammar_focus,
        culturalNotes: entry.cultural_notes,
        assessmentTypes: entry.assessment_types
      };
    }
    return null;
  };

  // Get all topics for AI scope control
  const getCompletedTopicsForAI = () => {
    return completedTopics.map(t => t.name || t);
  };

  // Mark a topic as completed
  const completeTopic = (topic) => {
    if (!completedTopics.find(t => t.id === topic.id)) {
      const newCompleted = [...completedTopics, topic];
      setCompletedTopics(newCompleted);
      updateActivityStreak();
      saveProgress();
    }
  };

  // Mark a lesson as completed
  const completeLesson = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      const newCompleted = [...completedLessons, lessonId];
      setCompletedLessons(newCompleted);
      updateActivityStreak();
      saveProgress();
    }
  };

  // Record a quiz score
  const recordQuizScore = (quizId, score, maxScore) => {
    const newScores = {
      ...quizScores,
      [quizId]: { score, maxScore, percentage: (score / maxScore) * 100, date: new Date().toISOString() }
    };
    setQuizScores(newScores);
    
    // Update proficiency based on scores
    updateProficiency(newScores);
    saveProgress();
  };

  // Track mistakes for personalized learning
  const recordMistake = (mistake) => {
    const existing = commonMistakes.find(m => m.type === mistake.type);
    if (existing) {
      existing.count += 1;
      setCommonMistakes([...commonMistakes]);
    } else {
      setCommonMistakes([...commonMistakes, { ...mistake, count: 1 }]);
    }
    saveProgress();
  };

  // Update proficiency level based on performance
  const updateProficiency = (scores) => {
    const scoreValues = Object.values(scores);
    if (scoreValues.length < 3) return;

    const recentScores = scoreValues.slice(-5);
    const avgPercentage = recentScores.reduce((sum, s) => sum + s.percentage, 0) / recentScores.length;

    let nextLevel = 'beginner';
    if (avgPercentage >= 85) {
      nextLevel = 'advanced';
    } else if (avgPercentage >= 65) {
      nextLevel = 'intermediate';
    }

    setProficiencyLevel(nextLevel);
    persistProficiency(nextLevel);
  };

  // Check if a topic is unlocked
  const isTopicUnlocked = (topicId) => {
    // First topic is always unlocked
    if (topicId === 1) return true;
    
    // Topic is unlocked if previous topic is completed
    return completedTopics.some(t => t.id === topicId - 1);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    // Simply increment week, cap at 12 per term
    const totalWeeks = 12;

    if (currentWeek < totalWeeks) {
      setCurrentWeek(currentWeek + 1);
    } else if (currentTerm < 3) {
      setCurrentTerm(currentTerm + 1);
      setCurrentWeek(1);
    } else {
      // Move to next class if available
      const classes = ['S1', 'S2', 'S3', 'S4'];
      const currentIndex = classes.indexOf(currentClass);
      if (currentIndex < classes.length - 1) {
        setCurrentClass(classes[currentIndex + 1]);
        setCurrentTerm(1);
        setCurrentWeek(1);
      }
    }
    saveProgress();
  };

  // Get syllabus context for AI
  const getSyllabusContext = () => {
    const weekData = getCurrentWeekData();
    return {
      class: currentClass,
      term: currentTerm,
      week: currentWeek,
      weekData,
      language,
      completedTopics: getCompletedTopicsForAI(),
      proficiencyLevel,
      commonMistakes
    };
  };

  const value = {
    // Current position
    currentClass,
    currentTerm,
    currentWeek,
    currentTopic,
    setCurrentClass,
    setCurrentTerm,
    setCurrentWeek,
    setCurrentTopic,

    // Learning mode
    learningMode,
    setLearningMode,

    // Language
    language,
    setLanguage: (lang) => { setLanguage(lang); persistLanguage(lang); },
    setProficiencyLevel: (level) => { setProficiencyLevel(level); persistProficiency(level); },

    // Progress data
    completedTopics,
    completedLessons,
    quizScores,
    practiceHistory,
    commonMistakes,
    proficiencyLevel,
    currentStreak,

    // Actions
    completeTopic,
    completeLesson,
    recordQuizScore,
    recordMistake,
    updateActivityStreak,
    goToNextWeek,
    isTopicUnlocked,

    // Helpers
    getCurrentWeekData,
    getCompletedTopicsForAI,
    getSyllabusContext,
    saveProgress,

    // Raw syllabus data
    syllabusContent
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};

export default LearningContext;
