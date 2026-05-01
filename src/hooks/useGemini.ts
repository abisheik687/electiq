/**
 * @module hooks.useGemini
 * @description Custom hook for managing state and interaction with Gemini.
 */

import { useState, useCallback } from 'react';
import { ChatMessage } from '../types/chat.types';
import { sha256 } from '../utils/crypto';
import { getCachedResponse, setCachedResponse } from '../utils/idb';

export const useGemini = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);

    const cacheKeyBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify({ text: text.trim().toLowerCase(), history }))
    );
    const hashArray = Array.from(new Uint8Array(cacheKeyBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const cachedResponse = await getCachedResponse(hash);

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setHistory(prev => [...prev, newUserMessage]);

    try {
      if (cachedResponse) {
        const newAiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: cachedResponse,
          timestamp: new Date()
        };
        setHistory(prev => [...prev, newAiMessage]);
        return;
      }

      const tokenRes = await fetch('/api/token');
      const { token } = await tokenRes.json();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: text,
          history: history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          }))
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch');
      }

      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      const aiMessageId = (Date.now() + 1).toString();
      let completeResponse = '';

      setHistory(prev => [
        ...prev, 
        { id: aiMessageId, role: 'assistant', content: '', timestamp: new Date() }
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              completeResponse += data.text;
              
              setHistory(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, content: completeResponse } : msg
              ));
            } catch (e) {
              console.error('Error parsing stream:', e);
            }
          }
        }
      }

      await setCachedResponse(hash, completeResponse);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [history]);

  return { history, loading, error, sendMessage };
};
