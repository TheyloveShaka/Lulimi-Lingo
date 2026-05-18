/**
 * Lulimi Lingo - AI Service Layer
 *
 * This service handles all AI API calls for the learning platform.
 * It supports multiple AI providers and manages the communication
 * between the frontend and AI models.
 */

import {
  getMasterSystemPrompt,
  buildLessonPrompt,
  buildPracticePrompt,
  buildQuizPrompt,
  buildFeedbackPrompt,
  buildOverviewPrompt,
  buildTutorChatPrompt,
  getEncouragement,
  getOutOfScopeResponse
} from './promptRouter';

// API Configuration - Node Backend
const AI_CONFIG = {
  // Node.js backend endpoint
  backendUrl:
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_NODE_BACKEND_URL ||
    'https://lulimi-lingo-production.up.railway.app',

  // Allow toggling mock responses during development
  useMockResponses: false
};

const resolveLanguageLabel = (language = 'luganda') => (
  String(language).trim().toLowerCase() === 'runyankole' ? 'Runyankole' : 'Luganda'
);

/**
 * Make an API call to the Node backend
 */
const callBackend = async (endpoint, payload) => {
  if (AI_CONFIG.useMockResponses) {
    return {
      success: false,
      error: 'Mock responses are disabled. Connect a live backend and AI provider keys.'
    };
  }

  try {
    const url = `${AI_CONFIG.backendUrl}/api/${endpoint}`;
    console.log(`📤 Calling backend: POST ${url}`, payload);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error ${response.status}:`, errorText);
      throw new Error(`Backend error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Backend response for ${endpoint}:`, data);
    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('❌ Backend Service Error:', error);
    return {
      success: false,
      error: error.message,
      response: "I'm having trouble connecting right now. Please try again in a moment."
    };
  }
};

// ----------------- Helpers and Parsers -----------------
const parsePracticeQuestions = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  try {
    if (typeof payload === 'string') return JSON.parse(payload);
    if (typeof payload === 'object' && payload.questions) return payload.questions;
  } catch (e) {
    console.warn('Failed to parse practice payload', e);
  }
  return [];
};

const parseQuiz = (payload) => {
  if (!payload) return null;
  try {
    if (typeof payload === 'object') return payload;
    return JSON.parse(payload);
  } catch (e) {
    console.warn('Failed to parse quiz payload', e);
    return null;
  }
};

const parseLesson = (content) => {
  if (!content) return null;
  if (typeof content === 'object') return content;

  const sections = {
    introduction: '',
    explanation: '',
    examples: [],
    culturalNote: ''
  };

  const lines = content.split('\n');
  let current = 'introduction';
  lines.forEach(line => {
    const lower = line.toLowerCase();
    if (lower.includes('introduction') || lower.includes('topic:')) current = 'introduction';
    else if (lower.includes('explanation') || lower.includes('concept')) current = 'explanation';
    else if (lower.includes('example')) current = 'examples';
    else if (lower.includes('cultural') || lower.includes('note')) current = 'culturalNote';

    if (current === 'examples' && line.trim().startsWith('-')) sections.examples.push(line.trim());
    else if (current !== 'examples') sections[current] += line + '\n';
  });

  return sections;
};

// ----------------- Generators with validation & retries -----------------
const withRetries = async (worker, validate, attempts = 3, delayMs = 600) => {
  for (let i = 0; i < attempts; i++) {
    const res = await worker();
    try {
      if (res && res.success !== false && validate(res)) return res;
    } catch (e) {
      console.warn('Validation threw error', e);
    }
    if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs));
  }
  return null;
};

export const generateLesson = async ({ classLevel, term, week, topic, objectives = [], language, proficiencyLevel, skipCache = false }) => {
  const payload = {
    class_level: classLevel,
    term,
    week,
    topic,
    objectives,
    language,
    proficiency_level: proficiencyLevel,
    skip_cache: skipCache,
    _nonce: Date.now() // Prevent cache collisions across views
  };

  const worker = () => callBackend('lesson', payload);
  const validate = (res) => {
    const lessonPayload = res.lesson || res.data;
    const parsed = lessonPayload && typeof lessonPayload === 'object' ? lessonPayload : (lessonPayload ? parseLesson(lessonPayload) : null);
    return !!parsed && typeof parsed === 'object' && (parsed.introduction || parsed.explanation || parsed.examples?.length);
  };

  const final = await withRetries(worker, validate, 3, 800);
  if (final) {
    const lessonPayload = final.lesson || final.data;
    const parsed = typeof lessonPayload === 'string' ? parseLesson(lessonPayload) : lessonPayload;
    return { success: true, lesson: parsed, raw: lessonPayload, cached: Boolean(final.cached), provider: final.provider || 'openai' };
  }
  return { success: false, error: 'AI did not return a valid lesson' };
};

export const generatePractice = async ({ topic, proficiencyLevel = 'beginner', commonMistakes = [], language, topicObjectives = [], skipCache = false }) => {
  const payload = {
    topic,
    proficiency_level: proficiencyLevel,
    common_mistakes: commonMistakes,
    language,
    topic_objectives: topicObjectives,
    skip_cache: skipCache,
    _nonce: Date.now() // Prevent cache collisions across views
  };

  const validate = (res) => {
    const questionsPayload = res.questions || res.practice?.questions || res.data?.questions;
    const qs = Array.isArray(questionsPayload) ? questionsPayload : parsePracticeQuestions(questionsPayload);
    if (!Array.isArray(qs) || qs.length === 0) return false;
    for (const q of qs) {
      if (!q || !q.question) return false;
      const type = (q.type || '').toLowerCase();
      if (type === 'multiple-choice') {
        if (!Array.isArray(q.options) || q.options.length < 2) return false;
        if (!q.correctAnswer) return false;
        // Accept answers that may not exactly match option string formatting
        // (AI may return slightly different punctuation/capitalization).
        // Only treat as invalid when options and correctAnswer are both missing or malformed.
      }
      if (type === 'translate' || type === 'fill-blank') {
        if (!q.correctAnswer && !Array.isArray(q.acceptableAnswers)) return false;
      }
      if (type === 'reorder') {
        if (!Array.isArray(q.tokens) || !Array.isArray(q.correctOrder)) return false;
      }
    }
    return true;
  };

  const worker = () => callBackend('practice', payload);
  const final = await withRetries(worker, validate, 3, 600);
  if (final) {
    const questionsPayload = final.questions || final.practice?.questions || final.data?.questions;
    const qs = Array.isArray(questionsPayload) ? questionsPayload : parsePracticeQuestions(questionsPayload);
    return { success: true, questions: qs, raw: questionsPayload, cached: Boolean(final.cached), provider: final.provider || 'openai' };
  }

  return { success: false, error: 'AI did not return valid practice questions' };
};

export const generateQuiz = async ({ topic, numberOfQuestions = 5, assessmentCriteria = [], language, proficiencyLevel, skipCache = false }) => {
  const payload = { 
    topic, 
    number_of_questions: numberOfQuestions, 
    assessment_criteria: assessmentCriteria, 
    language, 
    proficiency_level: proficiencyLevel,
    skip_cache: skipCache,
    _nonce: Date.now() // Prevent cache collisions across views
  };

  const validate = (res) => {
    const quizPayload = res.quiz || res.data;
    const parsed = quizPayload && typeof quizPayload === 'object' ? quizPayload : (quizPayload ? parseQuiz(quizPayload) : null);
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) return false;
    for (const q of parsed.questions) {
      if (!q.question) return false;
      const type = (q.type || '').toLowerCase();
      if (type === 'multiple-choice' && (!Array.isArray(q.options) || q.options.length < 2 || !q.correctAnswer)) return false;
    }
    return true;
  };

  const worker = () => callBackend('quiz', payload);
  const final = await withRetries(worker, validate, 3, 700);
  if (final) {
    const quizPayload = final.quiz || final.data;
    const parsed = quizPayload && typeof quizPayload === 'object' ? quizPayload : (quizPayload ? parseQuiz(quizPayload) : null);
    return { success: true, quiz: parsed, raw: quizPayload, cached: Boolean(final.cached), provider: final.provider || 'openai' };
  }

  return { success: false, error: 'AI did not return a valid quiz' };
};

export const generateFeedback = async ({ learnerAnswers = {}, correctAnswers = {}, topicObjectives = [], language }) => {
  const payload = { learner_answers: learnerAnswers, correct_answers: correctAnswers, topic_objectives: topicObjectives, language };
  const worker = () => callBackend('feedback', payload);
  const validate = (res) => !!res && (res.feedback || res.recommendations);
  const final = await withRetries(worker, validate, 2, 500);
  if (final) return { success: true, feedback: final.feedback || final.recommendations, raw: final, provider: final.provider || 'openai' };
  return { success: false, error: 'AI did not return feedback' };
};

export const chatWithTutor = async ({ message, completedTopics = [], conversationHistory = [], language, proficiencyLevel }) => {
  const languageLabel = resolveLanguageLabel(language);
  const payload = {
    message,
    completed_topics: completedTopics || [],
    conversation_history: conversationHistory.slice(-5),
    language,
    proficiency_level: proficiencyLevel
  };

  console.log('🎤 Chat payload:', payload);
  const result = await callBackend('chat', payload);

  if (!result.success) console.warn('Chat request failed:', result.error);

  return {
    success: result.success !== false,
    response: result.response || result.content || `I'm here to help you learn ${languageLabel}!`,
    encouragement: result.encouragement || (Math.random() > 0.7 ? getEncouragement() : null),
    provider: result.provider || 'openai',
    error: result.error
  };
};

export const translateText = async (text, sourceLang = 'en', targetLang = 'lg') => {
  const result = await callBackend('translate', { text, source_lang: sourceLang, target_lang: targetLang });
  if (result.success && result.translation) return { success: true, translation: result.translation, sourceLang, targetLang, model: result.model || 'openai' };
  return { success: false, translation: '', error: result.error || 'Translation failed' };
};

export const validateLuganda = async (text) => {
  try {
    const result = await callBackend('feedback', { user_answer: text, correct_answer: '', context: { validateOnly: true } });
    return { success: true, isValid: result.success, message: result.feedback || 'Text validated' };
  } catch (error) {
    console.error('Luganda validation error:', error);
    return { success: false, isValid: true, message: 'Validation unavailable' };
  }
};

 