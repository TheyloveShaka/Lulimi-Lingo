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
  // Current learning position tells the app which syllabus slice to show.
  const [currentClass, setCurrentClass] = useState('S1');
  const [currentTerm, setCurrentTerm] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentTopic, setCurrentTopic] = useState(null);
  // Selected UI/learning language keeps prompts and labels aligned with the learner.
  const [language, setLanguage] = useState('luganda');

  // Learning progress is stored here so every page can read the same shared state.
  const [completedTopics, setCompletedTopics] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [quizScores, setQuizScores] = useState({});
  const [practiceHistory, setPracticeHistory] = useState([]);

  // Mistake tracking helps the app personalize future lessons and practice.
  const [commonMistakes, setCommonMistakes] = useState([]);
  const [proficiencyLevel, setProficiencyLevel] = useState('beginner');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState(null);

  // Current mode tells the UI which learning activity is active right now.
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

  // Persist the current snapshot so refreshes do not wipe the learner state.
  const saveProgress = (overrides = {}) => {
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
      lastActivityDate,
      ...overrides
    };
    localStorage.setItem('lulimiLingoProgress', JSON.stringify(progress));
  };

  // Streaks reward consecutive days of practice and keep learners engaged.
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

  // Auto-save progress whenever tracked learning state changes
  useEffect(() => {
    saveProgress();
  }, [
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
  ]);

  // This converts the syllabus JSON into the active lesson context for the UI.
  const getCurrentWeekData = () => {
    // Match on language too, otherwise a Runyankole learner would pull the
    // Luganda entry and see Luganda topic titles/objectives in their lessons.
    const normalizedLanguage = String(language || 'luganda').trim().toLowerCase();
    const entry = syllabusContent.find(s =>
      s.class === currentClass &&
      s.term === currentTerm &&
      String(s.language || '').trim().toLowerCase() === normalizedLanguage
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

  // The AI only needs the topics already completed, so we send a compact list.
  const getCompletedTopicsForAI = () => {
    return completedTopics.map(t => t.name || t);
  };

  // Completion updates feed both progress tracking and streak calculation.
  const completeTopic = (topic) => {
    if (!completedTopics.find(t => t.id === topic.id)) {
      const newCompleted = [...completedTopics, topic];
      setCompletedTopics(newCompleted);
      updateActivityStreak();
      saveProgress({ completedTopics: newCompleted });
    }
  };

  // Lesson completion is tracked separately from topic completion.
  const completeLesson = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      const newCompleted = [...completedLessons, lessonId];
      setCompletedLessons(newCompleted);
      updateActivityStreak();
      saveProgress({ completedLessons: newCompleted });
    }
  };

  // Quiz scores are stored so we can show history and adjust proficiency.
  const recordQuizScore = (quizId, score, maxScore) => {
    const newScores = {
      ...quizScores,
      [quizId]: { score, maxScore, percentage: (score / maxScore) * 100, date: new Date().toISOString() }
    };
    setQuizScores(newScores);
    
    // Update proficiency based on scores
    updateProficiency(newScores);
    saveProgress({ quizScores: newScores });
  };

  // Mistakes are grouped by type so the next practice set can target weak spots.
  const recordMistake = (mistake) => {
    const existing = commonMistakes.find(m => m.type === mistake.type);
    let updatedMistakes;
    if (existing) {
      existing.count += 1;
      updatedMistakes = [...commonMistakes];
      setCommonMistakes(updatedMistakes);
    } else {
      updatedMistakes = [...commonMistakes, { ...mistake, count: 1 }];
      setCommonMistakes(updatedMistakes);
    }
    saveProgress({ commonMistakes: updatedMistakes });
  };

  // Proficiency is derived from recent scores instead of being manually set.
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

  // ---- Real per-week progress & gating ----
  // A week is half-done when its lesson is complete and fully done once its quiz
  // has been attempted. These keys are written by LessonView/QuizView.
  const isLessonDone = (weekId) => completedLessons.includes(`week-${weekId}-lesson`);
  const isQuizDone = (weekId) => quizScores[`week-${weekId}-quiz`] !== undefined;

  const getWeekProgress = (weekId) => {
    return (isLessonDone(weekId) ? 50 : 0) + (isQuizDone(weekId) ? 50 : 0);
  };

  const isWeekComplete = (weekId) => getWeekProgress(weekId) >= 100;

  // Unlock rule: the first two weeks are always open; every later week opens only
  // once the immediately preceding week is fully complete.
  const isWeekUnlocked = (orderedWeekIds, weekId) => {
    const idx = orderedWeekIds.indexOf(weekId);
    if (idx <= 1) return true;
    return isWeekComplete(orderedWeekIds[idx - 1]);
  };

  // Wipe all learning progress (used by the Settings "reset progress" action).
  const resetProgress = () => {
    setCompletedTopics([]);
    setCompletedLessons([]);
    setQuizScores({});
    setPracticeHistory([]);
    setCommonMistakes([]);
    setProficiencyLevel('beginner');
    setCurrentStreak(0);
    setLastActivityDate(null);
    localStorage.removeItem('lulimiLingoProgress');
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
    getWeekProgress,
    isWeekComplete,
    isWeekUnlocked,
    resetProgress,

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
