/**
 * @module components.ChatInput
 * @description Form for submitting chat messages.
 */

import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { sanitizeInput } from '../utils/sanitize';
import styles from './ChatInterface.module.css';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const { translate } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeInput(input).trim();
    if (!sanitized || sanitized.length > 500) return;
    
    setInput('');
    await onSend(sanitized);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    } else if (e.key === 'Escape') {
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.chatForm}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={translate('Type your question...')}
        maxLength={500}
        className={styles.inputField}
        aria-label={translate('Chat input')}
        disabled={disabled}
      />
      <button 
        type="submit" 
        disabled={disabled || !input.trim() || input.length > 500} 
        className={styles.sendButton} 
        aria-label={translate('Send message')}
      >
        {translate('Send')}
      </button>
    </form>
  );
};
