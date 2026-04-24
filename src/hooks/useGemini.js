import { useState, useCallback } from 'react';
import { sendMessageToGemini } from '../services/geminiService';

/**
 * Custom hook for managing state and interaction with Gemini.
 * @returns {Object} { history, loading, error, sendMessage }
 */
export const useGemini = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (text) => {
    setLoading(true);
    setError(null);

    // Cache check in sessionStorage
    const cacheKey = `gemini_cache_${text.trim().toLowerCase()}`;
    const cachedResponse = sessionStorage.getItem(cacheKey);

    const newUserMessage = { role: 'user', parts: [{ text }] };
    
    // We only take the previous successful history
    const currentHistory = history.filter(msg => msg.role && msg.parts);

    try {
      let aiText = '';

      if (cachedResponse) {
        aiText = cachedResponse;
      } else {
        // Send to backend
        aiText = await sendMessageToGemini(text, currentHistory);
        sessionStorage.setItem(cacheKey, aiText);
      }

      const newAiMessage = { role: 'model', parts: [{ text: aiText }] };
      setHistory([...currentHistory, newUserMessage, newAiMessage]);
      return aiText;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [history]);

  return { history, loading, error, sendMessage };
};
