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
  
  // Fallback to mock responses if backend is down
  useMockResponses: false
};

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

/**
 * Generate a lesson for a specific topic
 */
export const generateLesson = async ({ classLevel, term, week, topic, objectives, language, proficiencyLevel }) => {
  const result = await callBackend('lesson', {
    class_level: classLevel,
    term: term,
    week: week,
    topic: topic,
    objectives: objectives || [],
    language: language,
    proficiency_level: proficiencyLevel
  });

  const lessonPayload = result.lesson || result.data;

  if (result.success && lessonPayload) {
    return {
      success: true,
      lesson: typeof lessonPayload === 'string' ? parseLesson(lessonPayload) : lessonPayload,
      raw: lessonPayload,
      cached: Boolean(result.cached),
      provider: result.provider || 'openai'
    };
  }
  return result;
};

/**
 * Generate practice questions
 */
export const generatePractice = async ({ topic, proficiencyLevel, commonMistakes, language }) => {
  const result = await callBackend('practice', {
    topic: topic,
    proficiency_level: proficiencyLevel || 'beginner',
    common_mistakes: commonMistakes || [],
    language: language
  });

  const questionsPayload = result.questions || result.practice?.questions || result.data?.questions;

  if (result.success && questionsPayload) {
    return {
      success: true,
      questions: Array.isArray(questionsPayload) ? questionsPayload : parsePracticeQuestions(questionsPayload),
      raw: questionsPayload,
      cached: Boolean(result.cached),
      provider: result.provider || 'openai'
    };
  }
  return result;
};

/**
 * Generate a quiz
 */
export const generateQuiz = async ({ topic, numberOfQuestions, assessmentCriteria, language, proficiencyLevel }) => {
  const result = await callBackend('quiz', {
    topic: topic,
    number_of_questions: numberOfQuestions || 5,
    assessment_criteria: assessmentCriteria || [],
    language: language,
    proficiency_level: proficiencyLevel
  });

  const quizPayload = result.quiz || result.data;

  if (result.success && quizPayload) {
    return {
      success: true,
      quiz: typeof quizPayload === 'object' ? quizPayload : parseQuiz(quizPayload),
      raw: quizPayload,
      cached: Boolean(result.cached),
      provider: result.provider || 'openai'
    };
  }
  return result;
};

/**
 * Generate feedback for learner answers
 */
export const generateFeedback = async ({ learnerAnswers, correctAnswers, topicObjectives, language }) => {
  const result = await callBackend('feedback', {
    learner_answers: learnerAnswers || {},
    correct_answers: correctAnswers || {},
    topic_objectives: topicObjectives || [],
    language: language
  });

  if (result.success && result.feedback) {
    return {
      success: true,
      feedback: typeof result.feedback === 'string' ? parseFeedback(result.feedback) : result.feedback,
      encouragement: getEncouragement(),
      raw: result.feedback
    };
  }
  return result;
};

/**
 * Generate topic overview for revision
 */
export const generateOverview = async ({ topic, completedLessons, keyObjectives }) => {
  // Use lesson endpoint for overview generation
  const result = await callBackend('lesson', {
    topic: `Overview: ${topic}`,
    context: {
      completedLessons,
      keyObjectives,
      isOverview: true
    }
  });

  if (result.success) {
    return {
      success: true,
      overview: result.lesson,
      raw: result.lesson
    };
  }
  return result;
};

/**
 * Chat with the AI tutor
 */
export const chatWithTutor = async ({ message, completedTopics, conversationHistory = [], language, proficiencyLevel }) => {
  const payload = {
    message: message,
    completed_topics: completedTopics || [],
    conversation_history: conversationHistory.slice(-5), // Last 5 messages
    language,
    proficiency_level: proficiencyLevel
  };

  console.log('🎤 Chat payload:', payload);
  const result = await callBackend('chat', payload);

  if (!result.success) {
    console.warn('Chat request failed:', result.error);
  }

  return {
    success: result.success !== false,
    response: result.response || result.content || "I'm here to help you learn Luganda!",
    encouragement: result.encouragement || (Math.random() > 0.7 ? getEncouragement() : null),
    provider: result.provider || 'openai',
    error: result.error
  };
};

/**
 * Translate text using OpenAI (best translation quality)
 */
export const translateText = async (text, sourceLang = 'en', targetLang = 'lg') => {
  const result = await callBackend('translate', {
    text: text,
    source_lang: sourceLang,
    target_lang: targetLang
  });

  if (result.success && result.translation) {
    return {
      success: true,
      translation: result.translation,
      sourceLang: sourceLang,
      targetLang: targetLang,
      model: result.model || 'openai'
    };
  }
  return {
    success: false,
    translation: '',
    error: result.error || 'Translation failed'
  };
};

/**
 * Validate Luganda text
 */
export const validateLuganda = async (text) => {
  try {
    const result = await callBackend('feedback', {
      user_answer: text,
      correct_answer: '',
      context: {
        validateOnly: true
      }
    });

    return {
      success: true,
      isValid: result.success,
      message: result.feedback || 'Text validated'
    };
  } catch (error) {
    console.error('Luganda validation error:', error);
    return { success: false, isValid: true, message: 'Validation unavailable' };
  }
};

// ============ PARSING HELPERS ============

/**
 * Parse lesson content from AI response
 */
const parseLesson = (content) => {
  // Basic parsing - can be enhanced with more structured output
  const sections = {
    introduction: '',
    explanation: '',
    examples: [],
    culturalNote: ''
  };

  // Simple section extraction
  const lines = content.split('\n');
  let currentSection = 'introduction';

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('introduction') || lowerLine.includes('topic:')) {
      currentSection = 'introduction';
    } else if (lowerLine.includes('explanation') || lowerLine.includes('concept')) {
      currentSection = 'explanation';
    } else if (lowerLine.includes('example')) {
      currentSection = 'examples';
    } else if (lowerLine.includes('cultural') || lowerLine.includes('note')) {
      currentSection = 'culturalNote';
    }

    if (currentSection === 'examples' && line.includes('-')) {
      sections.examples.push(line.trim());
    } else if (currentSection !== 'examples') {
      sections[currentSection] += line + '\n';
    }
  });

  return sections;
};

/**
 * Parse practice questions from AI response
 */
const parsePracticeQuestions = (content) => {
  const questions = [];
  const lines = content.split('\n');
  let currentQuestion = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (/^\d+[\.\)]/.test(trimmed)) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = {
        question: trimmed.replace(/^\d+[\.\)]\s*/, ''),
        type: detectQuestionType(trimmed),
        options: [],
        answer: null
      };
    } else if (currentQuestion && /^[a-d][\.\)]/i.test(trimmed)) {
      currentQuestion.options.push(trimmed.replace(/^[a-d][\.\)]\s*/i, ''));
    }
  });

  if (currentQuestion) questions.push(currentQuestion);
  return questions;
};

/**
 * Detect question type from text
 */
const detectQuestionType = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('fill in') || lower.includes('blank') || lower.includes('___')) {
    return 'fill-blank';
  } else if (lower.includes('translate')) {
    return 'translate';
  } else if (lower.includes('reorder') || lower.includes('arrange')) {
    return 'reorder';
  } else if (lower.includes('choose') || lower.includes('select')) {
    return 'multiple-choice';
  }
  return 'open';
};

/**
 * Parse quiz from AI response
 */
const parseQuiz = (content) => {
  return {
    questions: parsePracticeQuestions(content),
    totalPoints: 0,
    timeLimit: null
  };
};

/**
 * Parse feedback from AI response
 */
const parseFeedback = (content) => {
  return {
    summary: content,
    score: null,
    strengths: [],
    weaknesses: [],
    recommendations: []
  };
};

/**
 * Parse overview from AI response
 */
const parseOverview = (content) => {
  return {
    summary: content,
    keyPoints: [],
    examples: [],
    commonMistakes: []
  };
};

// ============ MOCK RESPONSES FOR DEVELOPMENT ============

/**
 * Generate mock responses when no API is configured
 */
const generateMockResponse = (prompt, mode) => {
  const mockResponses = {
    LESSON: `📘 **Introduction to Greetings in Luganda**

Greetings are fundamental in Luganda culture. They show respect and build relationships. In this lesson, you'll learn the basic greetings used daily.

**Concept Explanation:**
In Luganda, greetings change based on the time of day and the age of the person you're greeting. It's important to use the correct form to show proper respect.

**Examples:**
- "Oli otya?" - How are you? (informal, to peers)
- "Gyebale ko" - Well done / Thank you for your work
- "Wasuze otya?" - Good morning (literally: How did you sleep?)
- "Osiibye otya?" - Good afternoon/evening (literally: How was your day?)
- "Webale" - Thank you

**Cultural Note:**
In Luganda culture, it's considered rude to jump straight into conversation without proper greetings. Always take time to greet and ask about someone's wellbeing first.`,

    PRACTICE: `✍🏾 **Practice Questions: Greetings**

1. Fill in the blank: "_____ otya?" (How are you?)
   a) Oli
   b) Gwe
   c) Nze

2. Translate to Luganda: "Good morning"
   
3. Choose the correct response to "Oli otya?":
   a) Webale
   b) Gyendi (I'm fine)
   c) Wasuze otya

4. Reorder these words to form a greeting: "otya / Wasuze"

5. Fill in the blank: "_____ ko" (Thank you for your work)
   a) Webale
   b) Gyebale
   c) Oli`,

    QUIZ: `🧪 **Quiz: Basic Luganda Greetings**

1. What is the appropriate greeting for the morning in Luganda?
   a) Osiibye otya?
   b) Wasuze otya?
   c) Oli otya?

2. Translate "Thank you" into Luganda.

3. When would you use "Osiibye otya?"?
   a) In the morning
   b) In the afternoon/evening
   c) At midnight

4. Complete this greeting: "Gyebale ___"

5. Why are greetings important in Luganda culture?`,

    FEEDBACK: `📊 **Your Performance Feedback**

**Overall:** Good effort! You're making progress with Luganda greetings.

**Strengths:**
- You correctly identified morning and evening greetings
- Good understanding of "Webale" (Thank you)

**Areas for Improvement:**
- Remember: "Wasuze otya?" is for morning, "Osiibye otya?" is for afternoon/evening
- Practice the response "Gyendi" (I'm fine)

**Explanation of Mistakes:**
Question 3: The correct answer was "Wasuze otya?" because this greeting specifically asks about how someone slept, making it appropriate for morning.

Keep practicing! You're doing great! 💪`,

    OVERVIEW: `📚 **Revision: Luganda Greetings**

**Summary:**
You've learned the essential greetings in Luganda, including time-based greetings and polite expressions.

**Key Rules:**
1. Always greet before starting a conversation
2. Use "Wasuze otya?" in the morning
3. Use "Osiibye otya?" in the afternoon/evening
4. Show respect with "Gyebale ko"

**Example Sentences:**
- Wasuze otya? - Good morning
- Gyendi - I'm fine
- Webale nnyo - Thank you very much

**Common Mistakes to Avoid:**
- Mixing up morning and evening greetings
- Forgetting to respond to greetings

**Practice Suggestions:**
- Greet family members in Luganda daily
- Practice with a partner`,

    TUTOR_CHAT: `Great question! 

Based on what you've learned so far, I can help explain this.

"Oli otya?" is an informal greeting meaning "How are you?" You can use it with friends and people your age.

The common response is "Gyendi" which means "I'm fine" or "I'm well."

Remember, in Luganda culture, it's polite to always ask about someone's wellbeing when you greet them!

Would you like to practice more greetings? 😊`
  };

  return {
    success: true,
    content: mockResponses[mode] || mockResponses.TUTOR_CHAT
  };
};

export default {
  generateLesson,
  generatePractice,
  generateQuiz,
  generateFeedback,
  generateOverview,
  chatWithTutor,
  validateLuganda
};
