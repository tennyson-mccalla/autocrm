'use client';

import { useState } from 'react';
import { SuggestionRequest, SuggestionResponse, TicketContext } from '@/app/types/llm-responses';

interface ResponseSuggestionProps {
  ticket: TicketContext;
  onSuggestionSelect: (suggestion: string) => void;
}

export default function ResponseSuggestion({ ticket, onSuggestionSelect }: ResponseSuggestionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null);
  const [style, setStyle] = useState({
    tone: 'professional',
    length: 'concise'
  });

  const logSuggestion = async (data: any) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('sb-localhost-auth-token');
      if (!token) {
        throw new Error('No auth token found');
      }
      const parsedToken = JSON.parse(token);

      const response = await fetch('/api/suggestions/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parsedToken.access_token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error('Failed to log suggestion');
      }
    } catch (error) {
      console.error('Failed to log suggestion:', error);
      // Don't throw error here, still allow the suggestion to be used
    }
  };

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketData: ticket,
          style,
        } as SuggestionRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestion');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestion(data);

      // Log the suggestion generation
      await logSuggestion({
        ticketId: ticket.id,
        originalSuggestion: data.suggestion,
        wasUsed: false,
        wasModified: false,
        metadata: {
          model: data.metadata?.model,
          tokensUsed: data.metadata?.tokensUsed,
          cost: data.metadata?.cost,
          tone: style.tone,
          length: style.length
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionUse = async (suggestionText: string) => {
    // Log the suggestion use
    await logSuggestion({
      ticketId: ticket.id,
      originalSuggestion: suggestionText,
      wasUsed: true,
      wasModified: false,
      metadata: {
        model: suggestion?.metadata?.model,
        tokensUsed: suggestion?.metadata?.tokensUsed,
        cost: suggestion?.metadata?.cost,
        tone: style.tone,
        length: style.length
      }
    });

    // Call the original onSuggestionSelect
    onSuggestionSelect(suggestionText);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Response Suggestion</h3>
        <div className="flex gap-2">
          <select
            className="text-sm border rounded pl-3 pr-8 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent cursor-pointer"
            value={style.tone}
            onChange={(e) => setStyle(prev => ({ ...prev, tone: e.target.value }))}
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
          </select>
          <select
            className="text-sm border rounded pl-3 pr-8 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent cursor-pointer"
            value={style.length}
            onChange={(e) => setStyle(prev => ({ ...prev, length: e.target.value }))}
          >
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGetSuggestion}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded ${
          isLoading
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
        }`}
      >
        {isLoading ? 'Generating...' : 'Get AI Suggestion'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {suggestion && !error && (
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border rounded dark:border-gray-600">
            <p className="whitespace-pre-wrap dark:text-gray-100">{suggestion.suggestion}</p>
          </div>

          {suggestion.metadata && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Model: {suggestion.metadata.model}</span>
              <span>Tokens: {suggestion.metadata.tokensUsed}</span>
              <span>Cost: ${suggestion.metadata.cost.toFixed(4)}</span>
            </div>
          )}

          <button
            onClick={() => handleSuggestionUse(suggestion.suggestion)}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded"
          >
            Use This Response
          </button>
        </div>
      )}
    </div>
  );
}
