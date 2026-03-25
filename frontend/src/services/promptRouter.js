/**
 * Lulimi Lingo - AI Prompt Router Service
 * 
 * This service dynamically routes requests to the appropriate AI prompt
 * based on the current learning mode (Lesson, Practice, Quiz, etc.)
 */

import aiPrompts from '../config/aiPrompts.json';

// Learning modes
export const MODES = {
  LESSON: 'LESSON',
  PRACTICE: 'PRACTICE',
  QUIZ: 'QUIZ',
  FEEDBACK: 'FEEDBACK',
  OVERVIEW: 'OVERVIEW',
  TUTOR_CHAT: 'TUTOR_CHAT'
};

/**
 * Get the master system prompt for the AI
 */
export const getMasterSystemPrompt = () => {
  return aiPrompts.masterSystemPrompt;
};

/**
 * Get the project context for AI awareness
 */
export const getProjectContext = () => {
  return aiPrompts.projectContext;
};

/**
 * Get mode-specific configuration
 */
export const getModeConfig = (mode) => {
  return aiPrompts.modes[mode] || null;
};

/**
 * Build a complete prompt for a specific mode with inputs
 * @param {string} mode - The learning mode (LESSON, PRACTICE, etc.)
 * @param {object} inputs - The input values to inject into the prompt
 * @returns {object} - Complete prompt object with system and user prompts
 */
export const buildPrompt = (mode, inputs) => {
  const modeConfig = aiPrompts.modes[mode];
  
  if (!modeConfig) {
    throw new Error(`Unknown mode: ${mode}`);
  }

  // Replace template variables with actual values
  let userPrompt = modeConfig.promptTemplate;
  
  Object.keys(inputs).forEach(key => {
    const placeholder = `{{${key}}}`;
    const value = Array.isArray(inputs[key]) 
      ? inputs[key].join(', ') 
      : inputs[key] || 'Not provided';
    userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), value);
  });

  return {
    systemPrompt: aiPrompts.masterSystemPrompt,
    userPrompt,
    mode,
    modeConfig
  };
};

/**
 * Build LESSON mode prompt
 */
export const buildLessonPrompt = ({ classLevel, term, week, topic, objectives }) => {
  return buildPrompt(MODES.LESSON, {
    class: classLevel,
    term,
    week,
    topic,
    objectives
  });
};

/**
 * Build PRACTICE mode prompt
 */
export const buildPracticePrompt = ({ topic, proficiencyLevel = 'beginner', commonMistakes = [] }) => {
  return buildPrompt(MODES.PRACTICE, {
    topic,
    proficiencyLevel,
    commonMistakes: commonMistakes.length > 0 ? commonMistakes : ['None recorded yet']
  });
};

/**
 * Build QUIZ mode prompt
 */
export const buildQuizPrompt = ({ topic, numberOfQuestions = 5, assessmentCriteria = [] }) => {
  return buildPrompt(MODES.QUIZ, {
    topic,
    numberOfQuestions: numberOfQuestions.toString(),
    assessmentCriteria: assessmentCriteria.length > 0 ? assessmentCriteria : ['Understanding of vocabulary', 'Correct sentence structure', 'Cultural appropriateness']
  });
};

/**
 * Build FEEDBACK mode prompt
 */
export const buildFeedbackPrompt = ({ learnerAnswers, correctAnswers, topicObjectives }) => {
  return buildPrompt(MODES.FEEDBACK, {
    learnerAnswers: JSON.stringify(learnerAnswers, null, 2),
    correctAnswers: JSON.stringify(correctAnswers, null, 2),
    topicObjectives
  });
};

/**
 * Build OVERVIEW mode prompt
 */
export const buildOverviewPrompt = ({ topic, completedLessons, keyObjectives }) => {
  return buildPrompt(MODES.OVERVIEW, {
    topic,
    completedLessons,
    keyObjectives
  });
};

/**
 * Build TUTOR_CHAT mode prompt
 */
export const buildTutorChatPrompt = ({ learnerQuestion, completedTopics }) => {
  return buildPrompt(MODES.TUTOR_CHAT, {
    learnerQuestion,
    completedTopics
  });
};

/**
 * Get a random encouragement message
 */
export const getEncouragement = () => {
  const messages = aiPrompts.errorResponses.encouragement;
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get out-of-scope response
 */
export const getOutOfScopeResponse = () => {
  return aiPrompts.errorResponses.outOfScope;
};

/**
 * Check if a topic is within the learner's completed scope
 */
export const isTopicInScope = (requestedTopic, completedTopics) => {
  return completedTopics.some(topic => 
    topic.toLowerCase().includes(requestedTopic.toLowerCase()) ||
    requestedTopic.toLowerCase().includes(topic.toLowerCase())
  );
};

/**
 * Format syllabus data for AI context
 */
export const formatSyllabusForAI = (syllabusData, classLevel, term, week) => {
  const classData = syllabusData.classes?.[classLevel];
  if (!classData) return null;

  const termData = classData[`term${term}`];
  if (!termData) return null;

  const weekData = termData.weeks?.find(w => w.weekNumber === week);
  if (!weekData) return null;

  return {
    class: classLevel,
    term: `Term ${term}`,
    week: `Week ${week}`,
    title: weekData.title,
    topics: weekData.topics,
    objectives: weekData.learningObjectives,
    vocabulary: weekData.vocabularyWords,
    grammar: weekData.grammarPoints,
    cultural: weekData.culturalNotes
  };
};

export default {
  MODES,
  getMasterSystemPrompt,
  getProjectContext,
  getModeConfig,
  buildPrompt,
  buildLessonPrompt,
  buildPracticePrompt,
  buildQuizPrompt,
  buildFeedbackPrompt,
  buildOverviewPrompt,
  buildTutorChatPrompt,
  getEncouragement,
  getOutOfScopeResponse,
  isTopicInScope,
  formatSyllabusForAI
};
