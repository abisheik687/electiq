/**
 * @module components.ChatContainer
 * @description Main container for the Chat Feature orchestrating messages and input.
 */

import React from 'react';
import FocusTrap from 'focus-trap-react';
import { useGemini } from '../hooks/useGemini';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import styles from './ChatInterface.module.css';

export const ChatContainer: React.FC = () => {
  const { history, loading, error, sendMessage } = useGemini();

  return (
    <FocusTrap active={loading}>
      <div className={styles.chatContainer}>
        <ChatMessages history={history} loading={loading} error={error} />
        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </FocusTrap>
  );
};

export default ChatContainer;
