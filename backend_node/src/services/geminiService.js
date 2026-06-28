/**
 * Gemini API Service
 * Unified interface for Google Generative AI API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    // The wrapper can run in mock mode when no key is configured.
    this.apiKey = process.env.GEMINI_API_KEY || 'your-gemini-api-key-here';
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.enabled = this.apiKey && this.apiKey !== 'your-gemini-api-key-here';
    this.client = null;

    if (this.enabled) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey);
      } catch (error) {
        console.error('Failed to initialize Gemini client:', error);
        this.enabled = false;
      }
    }
  }

  /**
   * Generate content using Gemini API
   * @param {string} prompt - The prompt to send to Gemini
   * @returns {Promise<string>} Generated content
   */
  async generateContent(prompt) {
    if (!this.enabled) {
      // Keep development flows alive even when Gemini is not configured.
      console.warn('Gemini API not enabled, returning mock response');
      return this._getMockResponse();
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return this._getMockResponse();
    }
  }

  /**
   * Chat with streaming support
   * @param {string} message - Message to send
   * @param {Array} history - Conversation history
   * @returns {Promise<string>} Response text
   */
  async chat(message, history = []) {
    if (!this.enabled) {
      return this._getMockResponse();
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini chat error:', error);
      return this._getMockResponse();
    }
  }

  _getMockResponse() {
    // Mock text makes the app fail softly instead of crashing the UI.
    return 'This is a mock response. Please configure your GEMINI_API_KEY environment variable.';
  }

  isEnabled() {
    return this.enabled;
  }
}

export default new GeminiService();
