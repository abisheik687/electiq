/**
 * @fileoverview Service for interacting with Gemini API proxy on our Express server.
 */

const API_URL = '/api/chat';

/**
 * Sends a message to the Gemini API proxy.
 * @param {string} message - The user's input message.
 * @param {Array<{role: string, parts: Array<{text: string}>}>} history - Chat history.
 * @returns {Promise<string>} The response text from the AI.
 */
export const sendMessageToGemini = async (message, history) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch from Gemini proxy');
  }

  const data = await response.json();
  return data.text;
};
