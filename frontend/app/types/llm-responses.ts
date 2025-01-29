export interface TicketContext {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string;
  customerEmail: string;
}

export interface SuggestionRequest {
  ticketData: TicketContext;
  style?: {
    tone?: 'professional' | 'friendly' | 'formal';
    length?: 'concise' | 'detailed';
  };
}

export interface SuggestionResponse {
  suggestion: string;
  error?: string;
  metadata?: {
    model: string;
    tokensUsed: number;
    cost: number;
  };
}

// Error types for better error handling
export type SuggestionError = {
  code: 'INVALID_REQUEST' | 'API_ERROR' | 'RATE_LIMIT' | 'TOKEN_LIMIT';
  message: string;
  details?: unknown;
}
