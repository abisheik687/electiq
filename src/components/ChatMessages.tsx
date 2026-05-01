/**
 * @module components.ChatMessages
 * @description Renders the chat history and loading states.
 */

import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useTranslation } from '../hooks/useTranslation';
import { ChatMessage } from '../types/chat.types';
import styles from './ChatInterface.module.css';

interface ChatMessagesProps {
  history: ChatMessage[];
  loading: boolean;
  error: string | null;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ history, loading, error }) => {
  const { translate } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const firstNewMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!loading && history.length > 0 && history[history.length - 1].role === 'assistant') {
      firstNewMessageRef.current?.focus();
    }
  }, [history, loading]);

  return (
    <div className={styles.chatHistory} aria-live="polite">
      {history.length === 0 && (
        <p className={styles.emptyState}>
          {translate('Ask me anything about the election process!')}
        </p>
      )}
      {history.map((msg, i) => {
        const isLastAssistantMsg = msg.role === 'assistant' && i === history.length - 1;
        return (
          <div
            key={msg.id}
            tabIndex={isLastAssistantMsg ? -1 : undefined}
            ref={isLastAssistantMsg ? firstNewMessageRef : null}
            className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
          >
            {msg.role === 'assistant' ? (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content) }} />
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
        );
      })}
      {loading && (
        <div 
          className={`${styles.message} ${styles.aiMessage} ${styles.typingIndicator}`} 
          aria-busy="true"
          aria-label="AI is typing a response"
          aria-live="polite"
        >
          <span aria-hidden="true">•••</span>
        </div>
      )}
      {error && <p className={styles.error} aria-live="assertive">{translate('Error: ')} {error}</p>}
      <div ref={bottomRef} />
    </div>
  );
};
