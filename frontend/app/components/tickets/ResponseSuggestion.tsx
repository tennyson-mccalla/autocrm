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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Response Suggestion</h3>
        <div className="flex gap-2">
          <select
            className="text-sm border rounded p-1"
            value={style.tone}
            onChange={(e) => setStyle(prev => ({ ...prev, tone: e.target.value }))}
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
          </select>
          <select
            className="text-sm border rounded p-1"
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
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isLoading ? 'Generating...' : 'Get AI Suggestion'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {suggestion && !error && (
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 border rounded">
            <p className="whitespace-pre-wrap">{suggestion.suggestion}</p>
          </div>

          {suggestion.metadata && (
            <div className="text-xs text-gray-500 flex justify-between">
              <span>Model: {suggestion.metadata.model}</span>
              <span>Tokens: {suggestion.metadata.tokensUsed}</span>
              <span>Cost: ${suggestion.metadata.cost.toFixed(4)}</span>
            </div>
          )}

          <button
            onClick={() => onSuggestionSelect(suggestion.suggestion)}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Use This Response
          </button>
        </div>
      )}
    </div>
  );
}
