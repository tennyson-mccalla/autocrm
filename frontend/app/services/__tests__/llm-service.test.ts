import { suggestResponse } from '../llm-service';
import { SuggestionRequest } from '@/app/types/llm-responses';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

const mockTicketData = {
  id: '123',
  title: 'Test Issue',
  description: 'Having problems with login',
  status: 'open',
  priority: 'high',
  customerEmail: 'customer@example.com'
};

describe('llm-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates response with default settings', async () => {
    const mockCompletion = {
      choices: [{ message: { content: 'Test response' } }],
      model: 'gpt-4',
      usage: { total_tokens: 100 }
    };

    (OpenAI as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(mockCompletion)
        }
      }
    }));

    const request: SuggestionRequest = {
      ticketData: mockTicketData
    };

    const result = await suggestResponse(request);

    expect(result.suggestion).toBe('Test response');
    expect(result.metadata?.model).toBe('gpt-4');
    expect(result.metadata?.tokensUsed).toBe(100);
  });

  it('handles API errors gracefully', async () => {
    (OpenAI as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('API Error'))
        }
      }
    }));

    const request: SuggestionRequest = {
      ticketData: mockTicketData
    };

    const result = await suggestResponse(request);

    expect(result.error).toBeDefined();
    expect(result.suggestion).toBe('');
  });

  it('calculates cost correctly for different models', async () => {
    const mockCompletion = {
      choices: [{ message: { content: 'Test response' } }],
      model: 'gpt-4',
      usage: { total_tokens: 1000 }
    };

    (OpenAI as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(mockCompletion)
        }
      }
    }));

    const request: SuggestionRequest = {
      ticketData: mockTicketData
    };

    const result = await suggestResponse(request);

    // GPT-4 cost: $0.03 per 1K tokens
    expect(result.metadata?.cost).toBe(0.03);
  });

  it('respects style settings in prompt', async () => {
    const createMock = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Test response' } }],
      model: 'gpt-4',
      usage: { total_tokens: 100 }
    });

    (OpenAI as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: { create: createMock }
      }
    }));

    const request: SuggestionRequest = {
      ticketData: mockTicketData,
      style: {
        tone: 'friendly',
        length: 'detailed'
      }
    };

    await suggestResponse(request);

    const callArgs = createMock.mock.calls[0][0];
    expect(callArgs.messages[1].content).toContain('friendly');
    expect(callArgs.messages[1].content).toContain('detailed');
  });
});
