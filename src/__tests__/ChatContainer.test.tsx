import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatContainer from '../components/ChatContainer';

vi.mock('../hooks/useGemini', () => ({
  useGemini: () => ({
    sendMessage: vi.fn().mockResolvedValue('Mocked AI response'),
    isLoading: false,
    error: null
  })
}));

describe('ChatContainer', () => {
  it('renders the chat interface', () => {
    render(<ChatContainer />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('sends a message on submit', async () => {
    render(<ChatContainer />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'What is democracy?' } });
    fireEvent.submit(input.closest('form') || input);
    await waitFor(() => {
      expect(screen.getByText('What is democracy?')).toBeInTheDocument();
    });
  });

  it('displays AI response after sending', async () => {
    render(<ChatContainer />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input.closest('form') || input);
    await waitFor(() => {
      expect(screen.getByText('Mocked AI response')).toBeInTheDocument();
    });
  });
});
