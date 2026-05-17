/**
 * Quiz Generator Service
 * Generates quizzes for Luganda learning
 */

import geminiService from './geminiService.js';
import { callOpenAIChat } from './aiService.js';

class QuizGeneratorService {
  constructor() {
    this.aiService = geminiService;
  }

  /**
   * Generate a quiz
   * @param {Object} params - Quiz parameters
   * @param {string} params.topic - The topic to quiz on
   * @param {number} params.numQuestions - Number of questions (default: 5)
   * @param {Array} params.criteria - Assessment criteria
   * @returns {Promise<Object>} Quiz with questions
   */
  async generate({ topic, numQuestions = 5, criteria = [], language = 'luganda', proficiencyLevel = 'beginner' }) {
    const languageName = language?.toLowerCase() === 'runyankole' ? 'Runyankole' : 'Luganda'
    const criteriaText = criteria.length 
      ? criteria.join(', ')
      : 'General knowledge';

    const prompt = `Generate a ${numQuestions}-question quiz for ${languageName} topic: "${topic}"

Assessment criteria: ${criteriaText}
Learner level: ${proficiencyLevel}

For each question provide in JSON format. Use a mix of types:
- multiple-choice
- true-false
- fill-blank
- translate
- matching
- reorder

Type-specific fields:
- multiple-choice, true-false: "options" array
- matching: "pairs" array of { "left": "...", "right": "..." }
- reorder: "tokens" (shuffled array) and "correctOrder" (correct array)

Format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct option exactly as written",
      "explanation": "Why this is correct",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Make questions progressively harder (start easy, end harder).
Return ONLY valid JSON.`;

    try {
      const openAiResponse = await callOpenAIChat([
        { role: 'system', content: `You are an expert ${languageName} assessment designer. Return only valid JSON, no markdown.` },
        { role: 'user', content: prompt }
      ], 850)
      return this._parseQuiz(openAiResponse, topic, numQuestions, 'openai', languageName)
    } catch (error) {
      console.error('Quiz generation OpenAI error:', error)
      try {
        if (this.aiService.isEnabled()) {
          const response = await this.aiService.generateContent(prompt)
          return this._parseQuiz(response, topic, numQuestions, 'gemini', languageName)
        }
      } catch (geminiError) {
        console.error('Quiz generation Gemini fallback error:', geminiError)
      }
      throw new Error('No AI provider available for quiz generation')
    }
  }

  _parseQuiz(content, topic, numQuestions, provider = 'unknown', languageName = 'Luganda') {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return {
            topic,
            numQuestions: parsed.questions.length,
            questions: parsed.questions,
            provider,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error('Failed to parse quiz JSON:', error);
    }
    return this._mockQuiz(topic, numQuestions, languageName);
  }

  _mockQuiz(topic, num = 5, languageName = 'Luganda') {
    if (languageName !== 'Luganda') {
      return {
        topic,
        numQuestions: num,
        questions: [
          {
            id: 1,
            type: "multiple-choice",
            question: `Choose the correct ${languageName} translation for: "Hello"`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            explanation: `"Option A" is the standard ${languageName} greeting.`,
            difficulty: "easy"
          }
        ],
        timestamp: new Date().toISOString()
      };
    }

    const allQuestions = [
      {
        id: 1,
        type: "multiple-choice",
        question: "What is the appropriate greeting for the morning in Luganda?",
        options: ["Osiibye otya?", "Wasuze otya?", "Oli otya?", "Weraba"],
        correctAnswer: "Wasuze otya?",
        explanation: "Wasuze otya? literally means 'How did you sleep?' and is used for morning greetings",
        difficulty: "easy"
      },
      {
        id: 2,
        type: "true-false",
        question: "True or False: 'Webale' means 'thank you' in Luganda.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Webale is the standard way to say thank you in Luganda.",
        difficulty: "easy"
      },
      {
        id: 3,
        type: "matching",
        question: "Match the Luganda phrase to its meaning.",
        pairs: [
          { left: "Gyendi", right: "I'm fine" },
          { left: "Webale", right: "Thank you" },
          { left: "Weraba", right: "Goodbye" }
        ],
        correctAnswer: "All pairs matched",
        explanation: "These are common Luganda greetings and responses.",
        difficulty: "medium"
      },
      {
        id: 4,
        type: "reorder",
        question: "Arrange the words to form a polite greeting.",
        tokens: ["otya?", "Wasuze"],
        correctOrder: ["Wasuze", "otya?"],
        correctAnswer: "Wasuze otya?",
        explanation: "Wasuze otya? means 'How did you sleep?' and is used in the morning.",
        difficulty: "medium"
      },
      {
        id: 5,
        type: "fill-blank",
        question: "Complete: 'Gyebale ___' (Well done/Thank you for your work)",
        options: ["nnyo", "ko", "otya", "bulungi"],
        correctAnswer: "ko",
        explanation: "Gyebale ko is a phrase expressing gratitude for someone's work.",
        difficulty: "hard"
      },
      {
        id: 6,
        type: "translate",
        question: "Translate 'Thank you very much' into Luganda.",
        correctAnswer: "Webale nnyo",
        explanation: "'Webale' means thank you and 'nnyo' means very much.",
        difficulty: "hard"
      }
    ];
    return {
      topic,
      numQuestions: Math.min(num, allQuestions.length),
      questions: allQuestions.slice(0, num),
      timestamp: new Date().toISOString()
    };
  }
}

export default new QuizGeneratorService();
