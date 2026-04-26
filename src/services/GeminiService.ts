/**
 * @module services.GeminiService
 * @description Service for interacting with Gemini API proxy.
 */

import { BaseService } from './BaseService';
import { ChatMessage } from '../types/chat.types';
import { QuizQuestion } from '../types/quiz.types';

export class GeminiService extends BaseService {
  private readonly API_URL = '/api/chat';
  private readonly QUIZ_API_URL = '/api/quiz'; // New endpoint for structured quiz

  /**
   * Sends a message to the Gemini API proxy.
   * @param message The user's input message.
   * @param history Chat history.
   * @returns The response text from the AI.
   */
  public async sendMessage(message: string, history: ChatMessage[]): Promise<string> {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await this.fetchJson<{text: string}>(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: formattedHistory }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to communicate with Gemini');
    }

    return response.data.text;
  }

  /**
   * Generates quiz questions using Gemini structured tool output.
   * @param topic Topic to generate questions for.
   */
  public async generateQuiz(topic: string): Promise<QuizQuestion[]> {
    const response = await this.fetchJson<{questions: QuizQuestion[]}>(this.QUIZ_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate quiz');
    }

    return response.data.questions;
  }
}

export const geminiService = new GeminiService();
