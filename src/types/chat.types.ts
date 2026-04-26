/**
 * @module chat.types
 * @description Type definitions for the Chat Interface.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}
