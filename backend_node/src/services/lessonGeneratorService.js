/**
 * Lesson Generator Service
 * Generates structured Luganda lessons using AI
 */

import geminiService from './geminiService.js';
import { callOpenAIChat } from './aiService.js';

class LessonGeneratorService {
  constructor() {
    this.aiService = geminiService;
  }

  /**
   * Generate a complete lesson
   * @param {Object} params - Lesson parameters
   * @param {string} params.classLevel - e.g., "S1", "S2"
   * @param {string} params.term - e.g., "Term 1"
   * @param {string} params.week - e.g., "Week 1"
   * @param {string} params.topic - The lesson topic
   * @param {Array} params.objectives - Learning objectives
   * @returns {Promise<Object>} Structured lesson content
   */
  async generate({ classLevel, term, week, topic, objectives = [], language = 'luganda', proficiencyLevel = 'beginner' }) {
    const languageName = language?.toLowerCase() === 'runyankole' ? 'Runyankole' : 'Luganda'
    const objectivesText = objectives.length 
      ? objectives.join(', ')
      : 'General introduction to the topic';

    const prompt = `Generate a ${languageName} lesson for:
Class: ${classLevel}
Term: ${term}
Week: ${week}
Topic: ${topic}
Objectives: ${objectivesText}
Learner level: ${proficiencyLevel}

Provide the lesson in this JSON structure:
{
  "introduction": "2-3 sentences introducing the topic",
  "explanation": "Main concept explanation with details",
  "examples": [
    {
      "text": "word or phrase in ${languageName}",
      "english": "English translation",
      "usage": "How to use it"
    }
  ],
  "culturalNote": "Relevant cultural context about this topic",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "activities": [
    {
      "name": "Activity name",
      "description": "How to do it",
      "duration": "15 mins"
    }
  ]
}

Return ONLY valid JSON.`;

    try {
      const openAiResponse = await callOpenAIChat([
        { role: 'system', content: `You are an expert ${languageName} teacher. Return only valid JSON, no markdown.` },
        { role: 'user', content: prompt }
      ], 900)
      return this._parseLesson(openAiResponse, topic, 'openai', languageName)
    } catch (error) {
      console.error('Lesson generation OpenAI error:', error)
      try {
        if (this.aiService.isEnabled()) {
          const response = await this.aiService.generateContent(prompt)
          return this._parseLesson(response, topic, 'gemini', languageName)
        }
      } catch (geminiError) {
        console.error('Lesson generation Gemini fallback error:', geminiError)
      }
      throw new Error('No AI provider available for lesson generation')
    }
  }

  _parseLesson(content, topic, provider = 'unknown', languageName = 'Luganda') {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          topic,
          ...parsed,
          provider,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Failed to parse lesson JSON:', error);
    }
    return this._mockLesson(topic, languageName);
  }

  _mockLesson(topic, languageName = 'Luganda') {
    const fallbackExamples = languageName === 'Luganda'
      ? [
        {
          text: "Oli otya?",
          english: "How are you?",
          usage: "Informal greeting to peers"
        },
        {
          text: "Webale",
          english: "Thank you",
          usage: "Expressing gratitude"
        },
        {
          text: "Gyendi",
          english: "I'm fine",
          usage: "Positive response to greetings"
        },
        {
          text: "Simanyi",
          english: "I don't understand",
          usage: "Asking for clarification"
        },
        {
          text: "Nsonyivu",
          english: "I'm sorry",
          usage: "Expressing apology"
        }
      ]
      : [
        {
          text: `${languageName} example phrase 1`,
          english: "English translation",
          usage: "Common greeting"
        },
        {
          text: `${languageName} example phrase 2`,
          english: "English translation",
          usage: "Simple response"
        },
        {
          text: `${languageName} example phrase 3`,
          english: "English translation",
          usage: "Polite expression"
        }
      ];

    return {
      topic,
      introduction: `Welcome to today's lesson on ${topic}! In ${languageName} culture, this topic is very important for daily communication and building relationships.`,
      explanation: `${topic} is an important part of ${languageName} language learning. Understanding this concept will help you communicate more effectively and show respect in social interactions.

There are several key aspects to understanding ${topic}:
1. Basic forms and usage
2. Cultural context and proper etiquette
3. Common variations and regional differences
4. How to apply it in real conversations`,
      examples: fallbackExamples,
      culturalNote: `In ${languageName} culture, it's essential to use proper greetings and respect forms. Always greet before starting a conversation. Younger people should initiate greetings with elders. Show respect through language choices.`,
      keyPoints: [
        `Always use proper ${topic} in appropriate contexts`,
        "Consider the age and status of the person you're communicating with",
        `Cultural norms are important in ${languageName} communication`,
        `Practice ${topic} regularly for fluency`,
        "Learn from native speakers when possible"
      ],
      activities: [
        {
          name: "Dialogue Practice",
          description: "Practice common conversations using today's content in pairs",
          duration: "10 mins"
        },
        {
          name: "Role Play",
          description: "Act out real-world scenarios using the new vocabulary",
          duration: "15 mins"
        },
        {
          name: "Writing Exercise",
          description: "Write 5 sentences using the new concepts",
          duration: "10 mins"
        }
      ],
      timestamp: new Date().toISOString()
    };
  }
}

export default new LessonGeneratorService();
