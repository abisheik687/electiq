/**
 * @module services.GeminiService
 * @description Service for interacting with Gemini API proxy.
 */

import { BaseService } from './BaseService';
import { ChatMessage } from '../types/models';
import { QuizQuestion } from '../types/models';

export class GeminiService extends BaseService {
  private readonly API_URL = '/api/chat';
  private readonly QUIZ_API_URL = '/api/quiz'; // New endpoint for structured quiz

  /**
   * Sends a message to the Gemini API proxy.
   * @param message The user's input message.
   * @param history Chat history.
   * @returns The response text from the AI.
   */
  public async sendMessage(message: string, history: ChatMessage[] = []): Promise<string> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data:'));
      for (const line of lines) {
        const data = JSON.parse(line.replace('data: ', ''));
        if (data.text) result += data.text;
      }
    }
    return result;
  }

  /**
   * Generates quiz questions using Gemini structured tool output.
   * @param topic Topic to generate questions for.
   */
  public async generateQuiz(topic: string): Promise<QuizQuestion[]> {
    const data = await this.request<{questions: QuizQuestion[]}>(this.QUIZ_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!data) {
      throw new Error('Failed to generate quiz');
    }

    return data.questions;
  }
}

export const geminiService = new GeminiService();
