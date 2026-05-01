import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '../services/GeminiService';

function createMockStream(chunks: string[]): ReadableStream {
  return new ReadableStream({
    start(controller) {
      chunks.forEach(chunk => {
        controller.enqueue(new TextEncoder().encode(chunk));
      });
      controller.close();
    }
  });
}

describe('GeminiService SSE Parsing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly parses a single SSE chunk', async () => {
    const mockChunk = 'data: {"text":"Hello"}\n\n';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createMockStream([mockChunk])
    });

    const service = new GeminiService();
    const result = await service.sendMessage('Hi', []);
    expect(result).toBe('Hello');
  });

  it('correctly concatenates fragmented SSE chunks', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createMockStream([
        'data: {"text":"Hello"}\n\n',
        'data: {"text":" World"}\n\n'
      ])
    });

    const service = new GeminiService();
    const result = await service.sendMessage('Hi', []);
    expect(result).toBe('Hello World');
  });

  it('handles empty response body gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createMockStream([])
    });

    const service = new GeminiService();
    const result = await service.sendMessage('Hi', []);
    expect(result).toBe('');
  });
});
