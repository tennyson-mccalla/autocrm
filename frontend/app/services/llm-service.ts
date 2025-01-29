import OpenAI from 'openai';
import { SuggestionRequest, SuggestionResponse, SuggestionError } from '../types/llm-responses';

// Initialize OpenAI client lazily to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please contact your administrator.');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful customer service representative.
Your goal is to provide clear, accurate, and helpful responses to customer inquiries.
Keep responses professional and focused on resolving the customer's issue.`;

export async function suggestResponse(
  request: SuggestionRequest
): Promise<SuggestionResponse> {
  try {
    const { ticketData, style = {} } = request;
    const { tone = 'professional', length = 'concise' } = style;

    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Please provide a ${tone}, ${length} response to the following customer ticket:

Title: ${ticketData.title}
Description: ${ticketData.description}
Priority: ${ticketData.priority}
Category: ${ticketData.category || 'N/A'}

The response should be appropriate for an email reply to ${ticketData.customerEmail}.`
        }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    });

    const suggestion = completion.choices[0]?.message?.content;

    if (!suggestion) {
      throw new Error('No suggestion generated');
    }

    return {
      suggestion,
      metadata: {
        model: completion.model,
        tokensUsed: completion.usage?.total_tokens || 0,
        cost: calculateCost(completion.usage?.total_tokens || 0, completion.model),
      },
    };
  } catch (error) {
    const errorResponse: SuggestionError = {
      code: 'API_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error,
    };
    return { suggestion: '', error: JSON.stringify(errorResponse) };
  }
}

function calculateCost(tokens: number, model: string): number {
  // GPT-4 pricing (as of 2024)
  const COST_PER_1K_TOKENS = {
    'gpt-4': 0.03,
    'gpt-3.5-turbo': 0.002,
  };

  const costPer1k = COST_PER_1K_TOKENS[model as keyof typeof COST_PER_1K_TOKENS] || 0.03;
  return (tokens / 1000) * costPer1k;
}
