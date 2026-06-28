/**
 * Practice Generator Service
 * Generates practice exercises for Luganda learning
 */

import geminiService from './geminiService.js';
import { callOpenAIChat } from './aiService.js';

class PracticeGeneratorService {
  constructor() {
    // OpenAI is preferred first, and Gemini is used if the primary call fails.
    this.aiService = geminiService;
  }

  /**
   * Generate practice questions
   * @param {Object} params - Practice parameters
   * @param {string} params.topic - The topic to practice
  * @param {string} params.proficiencyLevel - "beginner", "intermediate", or "advanced"
   * @param {Array} params.commonMistakes - Common mistakes to address
   * @returns {Promise<Array>} List of practice questions
   */
  async generate({ 
    topic, 
    proficiencyLevel = 'beginner', 
    commonMistakes = [],
    topicObjectives = [],
    language = 'luganda'
  }) {
    const languageName = language?.toLowerCase() === 'runyankole' ? 'Runyankole' : 'Luganda'
    const mistakesText = commonMistakes.length
      ? `Address these mistakes: ${commonMistakes.join(', ')}`
      : '';
    const objectivesText = Array.isArray(topicObjectives) && topicObjectives.length
      ? `\nTopic objectives: ${topicObjectives.join(', ')}`
      : '';

    const prompt = `Generate 5 varied practice questions for ${languageName} topic: "${topic}"

Proficiency level: ${proficiencyLevel}
Match the difficulty, vocabulary, and sentence length to a ${proficiencyLevel} learner.
${mistakesText}
${objectivesText}

Use a mix of these question types:
- fill-blank
- multiple-choice
- translate
- reorder
- matching
- reading-comprehension

Type-specific fields (use the SAME shape the assessment engine expects):
- multiple-choice: "options" array, plus "correctAnswer" matching one option exactly
- fill-blank: optional "options" array; always include "correctAnswer"
- translate: "correctAnswer" (and optional "acceptableAnswers" array of valid variants)
- matching: "pairs" array of { "left": "...", "right": "..." }
- reorder: "tokens" (shuffled array) and "correctOrder" (correct array)
- reading-comprehension: a "passage" field with a short ${languageName} reading text (2-4 sentences, level-appropriate), plus "options" and "correctAnswer" testing comprehension

IMPORTANT: Include at least ONE reading-comprehension question with a real ${languageName} passage so learners practice reading.
IMPORTANT: EVERY question must include a concise one-sentence "explanation" giving the reason the correct answer is right (this is shown to the learner when they miss it).

Provide in JSON format:
{
  "questions": [
    {
      "id": 1,
      "type": "fill-blank|multiple-choice|translate|reorder|matching|reading-comprehension",
      "question": "Question text",
      "passage": "Short reading passage (only for reading-comprehension)",
      "options": ["Option A", "Option B"],
      "pairs": [{ "left": "...", "right": "..." }],
      "tokens": ["..."],
      "correctOrder": ["..."],
      "correctAnswer": "The answer",
      "hint": "Helpful hint",
      "explanation": "Why this is correct"
    }
  ]
}

Only include the fields relevant to each question's type. Return ONLY valid JSON.`;

    try {
      // Ask for structured JSON so the frontend can render practice items consistently.
      const openAiResponse = await callOpenAIChat([
        { role: 'system', content: `You are an expert ${languageName} tutor. Return only valid JSON, no markdown.` },
        { role: 'user', content: prompt }
      ], 780)
      return this._parsePractice(openAiResponse, topic, 'openai', languageName)
    } catch (error) {
      console.error('Practice generation OpenAI error:', error)
      try {
        // The fallback keeps practice usable even when the main provider is unavailable.
        if (this.aiService.isEnabled()) {
          const response = await this.aiService.generateContent(prompt)
          return this._parsePractice(response, topic, 'gemini', languageName)
        }
      } catch (geminiError) {
        console.error('Practice generation Gemini fallback error:', geminiError)
      }
      throw new Error('No AI provider available for practice generation')
    }
  }

  async _parsePractice(content, topic, provider = 'unknown', languageName = 'Luganda') {
    // The parser repairs provider output into the exact shape the UI expects.
    const tryParse = (text) => {
      try {
        const jsonMatch = String(text || '').match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions)) return parsed;
      } catch (err) {
        return null;
      }
      return null;
    }

    let parsed = tryParse(content)
    if (parsed) {
      return { topic, totalQuestions: parsed.questions.length, questions: parsed.questions, provider, timestamp: new Date().toISOString() }
    }

    // Attempt one repair retry via OpenAI to return valid JSON
    try {
      const repairPrompt = `The previous AI response could not be parsed as valid JSON. Return ONLY valid JSON matching the schema: { "questions": [ { "id": number, "type": "fill-blank|multiple-choice|translate|reorder|matching", "question": "text", "options": ["..."], "correctAnswer": "...", "hint": "...", "explanation": "..." } ] } . Here is the raw response:\n\n${String(content)}\n\nReturn only the corrected JSON.`
      const repairResp = await callOpenAIChat([
        { role: 'system', content: `You are an expert ${languageName} tutor. Return only valid JSON, no markdown.` },
        { role: 'user', content: repairPrompt }
      ], 600)

      parsed = tryParse(repairResp)
      if (parsed) {
        return { topic, totalQuestions: parsed.questions.length, questions: parsed.questions, provider: 'openai-repair', timestamp: new Date().toISOString() }
      }
    } catch (err) {
      console.error('Practice repair attempt failed:', err.message)
    }

    // If still invalid, fail loudly so frontend can surface an error instead of using stale hardcoded content
    throw new Error('AI did not return valid practice questions')
  }

  _mockPractice(topic, languageName = 'Luganda') {
    if (languageName !== 'Luganda') {
      return {
        topic,
        totalQuestions: 5,
        questions: [
          {
            id: 1,
            type: "fill-blank",
            question: `Complete the ${languageName} phrase for: "Hello"`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            hint: `Use a common ${languageName} greeting`,
            explanation: `This is a standard ${languageName} greeting.`
          }
        ],
        timestamp: new Date().toISOString()
      }
    }
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
