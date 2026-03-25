/**
 * Practice Generator Service
 * Generates practice exercises for Luganda learning
 */

import geminiService from './geminiService.js';

class PracticeGeneratorService {
  constructor() {
    this.aiService = geminiService;
  }

  /**
   * Generate practice questions
   * @param {Object} params - Practice parameters
   * @param {string} params.topic - The topic to practice
   * @param {string} params.proficiencyLevel - "beginner", "developing", or "intermediate"
   * @param {Array} params.commonMistakes - Common mistakes to address
   * @returns {Promise<Array>} List of practice questions
   */
  async generate({ 
    topic, 
    proficiencyLevel = 'beginner', 
    commonMistakes = [] 
  }) {
    const mistakesText = commonMistakes.length
      ? `Address these mistakes: ${commonMistakes.join(', ')}`
      : '';

    const prompt = `Generate 5 varied practice questions for Luganda topic: "${topic}"

Proficiency level: ${proficiencyLevel}
${mistakesText}

Include these question types:
1. Fill in the blank
2. Multiple choice
3. Translation
4. Word reordering (if applicable)
5. Matching or open-ended

Provide in JSON format:
{
  "questions": [
    {
      "id": 1,
      "type": "fill-blank|multiple-choice|translate|reorder|matching",
      "question": "Question text",
      "options": ["Option A", "Option B"] (only for multiple choice/matching),
      "correctAnswer": "The answer",
      "hint": "Helpful hint",
      "explanation": "Why this is correct"
    }
  ]
}

Return ONLY valid JSON.`;

    try {
      if (this.aiService.isEnabled()) {
        const response = await this.aiService.generateContent(prompt);
        return this._parsePractice(response, topic);
      } else {
        return this._mockPractice(topic);
      }
    } catch (error) {
      console.error('Practice generation error:', error);
      return this._mockPractice(topic);
    }
  }

  _parsePractice(content, topic) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return {
            topic,
            totalQuestions: parsed.questions.length,
            questions: parsed.questions,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error('Failed to parse practice JSON:', error);
    }
    return this._mockPractice(topic);
  }

  _mockPractice(topic) {
    return {
      topic,
      totalQuestions: 5,
      questions: [
        {
          id: 1,
          type: "fill-blank",
          question: "Complete: '_____ otya?' (How are you?)",
          options: ["Oli", "Gwe", "Nze", "Ye"],
          correctAnswer: "Oli",
          hint: "This is the informal 'you' in Luganda",
          explanation: "Oli is the second person singular 'you' form in Luganda"
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "What does 'Wasuze otya?' mean?",
          options: ["Good night", "Good morning", "Goodbye", "Thank you"],
          correctAnswer: "Good morning",
          hint: "This greeting asks about how someone slept",
          explanation: "Wasuze otya? literally means 'How did you sleep?' and is used for morning greetings"
        },
        {
          id: 3,
          type: "translate",
          question: "Translate to Luganda: 'Thank you'",
          correctAnswer: "Webale",
          hint: "Starts with 'We...'",
          explanation: "Webale is the standard Luganda word for thank you"
        },
        {
          id: 4,
          type: "multiple-choice",
          question: "How do you respond to 'Oli otya?'",
          options: ["Webale", "Gyendi", "Wasuze otya", "Simanyi"],
          correctAnswer: "Gyendi",
          hint: "This means 'I'm fine'",
          explanation: "Gyendi is the standard greeting response meaning 'I'm fine'"
        },
        {
          id: 5,
          type: "translate",
          question: "Translate to English: 'Weraba'",
          correctAnswer: "Goodbye/Farewell",
          hint: "Means when parting ways",
          explanation: "Weraba is used to say goodbye when parting with someone"
        }
      ],
      timestamp: new Date().toISOString()
    };
  }
}

export default new PracticeGeneratorService();
