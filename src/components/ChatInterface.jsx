import { useState, useRef, useEffect } from 'react';
import { useGemini } from '../hooks/useGemini';
import { useTranslation } from '../hooks/useTranslation';
import { sanitizeInput } from '../utils/sanitize';
import styles from './ChatInterface.module.css';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const { history, loading, error, sendMessage } = useGemini();
  const { translate } = useTranslation();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitized = sanitizeInput(input).trim();
    if (!sanitized) return;
    
    setInput('');
    await sendMessage(sanitized);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHistory} aria-live="polite">
        {history.length === 0 && (
          <p className={styles.emptyState}>
            {translate('Ask me anything about the election process!')}
          </p>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
            <p>{msg.parts[0].text}</p>
          </div>
        ))}
        {loading && (
          <div className={`${styles.message} ${styles.aiMessage} ${styles.typingIndicator}`}>
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}
        {error && <p className={styles.error}>{translate('Error: ')} {error}</p>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.chatForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={translate('Type your question...')}
          maxLength={500}
          className={styles.inputField}
          aria-label={translate('Chat input')}
        />
        <button type="submit" disabled={loading || !input.trim()} className={styles.sendButton} aria-label={translate('Send message')}>
          {translate('Send')}
        </button>
      </form>
    </div>
  );
}
