import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '../components/ChatInterface';
import { useGemini } from '../hooks/useGemini';
import { useTranslation } from '../hooks/useTranslation';

// Mock the hooks
jest.mock('../hooks/useGemini');
jest.mock('../hooks/useTranslation');

describe('ChatInterface', () => {
  const mockSendMessage = jest.fn();

  beforeEach(() => {
    useTranslation.mockReturnValue({
      translate: (text) => text,
    });
    
    useGemini.mockReturnValue({
      history: [],
      loading: false,
      error: null,
      sendMessage: mockSendMessage,
    });
    
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat interface with empty state', () => {
    render(<ChatInterface />);
    expect(screen.getByText('Ask me anything about the election process!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your question...')).toBeInTheDocument();
  });

  it('sends a message when form is submitted', async () => {
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Type your question...');
    const button = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'How do I register to vote?' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('How do I register to vote?');
    });
  });

  it('disables send button when input is empty or loading', () => {
    useGemini.mockReturnValue({
      history: [],
      loading: true,
      error: null,
      sendMessage: mockSendMessage,
    });

    render(<ChatInterface />);
    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeDisabled();
  });

  it('displays error message if error exists', () => {
    useGemini.mockReturnValue({
      history: [],
      loading: false,
      error: 'API Key missing',
      sendMessage: mockSendMessage,
    });

    render(<ChatInterface />);
    expect(screen.getByText(/Error: API Key missing/)).toBeInTheDocument();
  });
});
