/**
 * Quiz Generator Service
 * Generates quizzes for Luganda learning
 */

import geminiService from './geminiService.js';

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
  async generate({ topic, numQuestions = 5, criteria = [] }) {
    const criteriaText = criteria.length 
      ? criteria.join(', ')
      : 'General knowledge';

    const prompt = `Generate a ${numQuestions}-question multiple choice quiz for Luganda topic: "${topic}"

Assessment criteria: ${criteriaText}

For each question provide in JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
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
      if (this.aiService.isEnabled()) {
        const response = await this.aiService.generateContent(prompt);
        return this._parseQuiz(response, topic, numQuestions);
      } else {
        return this._mockQuiz(topic, numQuestions);
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      return this._mockQuiz(topic, numQuestions);
    }
  }

  _parseQuiz(content, topic, numQuestions) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return {
            topic,
            numQuestions: parsed.questions.length,
            questions: parsed.questions,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error('Failed to parse quiz JSON:', error);
    }
    return this._mockQuiz(topic, numQuestions);
  }

  _mockQuiz(topic, num = 5) {
    const allQuestions = [
      {
        id: 1,
        question: "What is the appropriate greeting for the morning in Luganda?",
        options: ["Osiibye otya?", "Wasuze otya?", "Oli otya?", "Weraba"],
        correctAnswer: "Wasuze otya?",
        explanation: "Wasuze otya? literally means 'How did you sleep?' and is used for morning greetings",
        difficulty: "easy"
      },
      {
        id: 2,
        question: "Translate 'Thank you' into Luganda:",
        options: ["Gyendi", "Webale", "Nsanyuse", "Saawa"],
        correctAnswer: "Webale",
        explanation: "Webale is the standard way to say thank you in Luganda",
        difficulty: "easy"
      },
      {
        id: 3,
        question: "When would you use 'Osiibye otya?'",
        options: ["In the morning", "In the afternoon/evening", "At midnight", "When leaving"],
        correctAnswer: "In the afternoon/evening",
        explanation: "Osiibye otya? is used for afternoon and evening greetings",
        difficulty: "medium"
      },
      {
        id: 4,
        question: "What does 'Gyendi' mean?",
        options: ["Hello", "Goodbye", "I'm fine", "Thank you"],
        correctAnswer: "I'm fine",
        explanation: "Gyendi is the response to 'Oli otya?' meaning 'I'm fine'",
        difficulty: "medium"
      },
      {
        id: 5,
        question: "Complete: 'Gyebale ___' (Well done/Thank you for your work)",
        options: ["nnyo", "ko", "otya", "bulungi"],
        correctAnswer: "ko",
        explanation: "Gyebale ko is a phrase expressing gratitude for someone's work",
        difficulty: "hard"
      }
    ];

    // Return only the requested number of questions
    return {
      topic,
      numQuestions: Math.min(num, allQuestions.length),
      questions: allQuestions.slice(0, num),
      timestamp: new Date().toISOString()
    };
  }
}

export default new QuizGeneratorService();
