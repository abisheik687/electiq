import { renderHook, act } from '@testing-library/react';
import { useGemini } from '../hooks/useGemini';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('useGemini', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    
    // Mock IDB store functions
    vi.mock('../utils/idb', () => ({
      getCachedResponse: vi.fn().mockResolvedValue(null),
      setCachedResponse: vi.fn().mockResolvedValue(undefined)
    }));

    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
        }
      }
    });
  });

  it('handles streaming response properly', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"text":"Hello"}\n\n'));
        controller.enqueue(encoder.encode('data: {"text":" World"}\n\n'));
        controller.close();
      }
    });

    const fetchSpy = vi.spyOn(global, 'fetch');
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-token' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        body: stream
      } as unknown as Response);

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.sendMessage('Hi');
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[1].content).toBe('Hello World');
  });
});
