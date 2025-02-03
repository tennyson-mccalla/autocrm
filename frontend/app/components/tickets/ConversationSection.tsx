import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSupabaseClient } from '../../lib/supabase/client';
import type { Conversation } from '../../types';
import ResponseSuggestion from './ResponseSuggestion';
import type { TicketContext } from '@/app/types/llm-responses';

interface ConversationSectionProps {
  ticketId: string;
  ticket: TicketContext;
}

export default function ConversationSection({ ticketId, ticket }: ConversationSectionProps) {
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [lastSuggestion, setLastSuggestion] = useState<string | null>(null);
  const [lastSuggestionMetadata, setLastSuggestionMetadata] = useState<any | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      if (!ticketId) return;

      try {
        const client = getSupabaseClient();
        const { data, error } = await client
          .from('conversations')
          .select(`
            *,
            users (
              full_name,
              role
            )
          `)
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (mounted) {
          setMessages(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        if (mounted) {
          setError('Failed to load messages');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [ticketId]);

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
      // Don't throw error here, still allow the message to be sent
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const client = getSupabaseClient();

      // If this message was based on a suggestion, log any modifications
      if (lastSuggestion) {
        await logSuggestion({
          ticketId: ticketId,
          originalSuggestion: lastSuggestion,
          finalMessage: newMessage.trim(),
          wasUsed: true,
          wasModified: lastSuggestion !== newMessage.trim(),
          metadata: lastSuggestionMetadata
        });
      }

      const { error: sendError } = await client
        .from('conversations')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message: newMessage.trim(),
          internal_note: false
        });

      if (sendError) throw sendError;

      setNewMessage('');
      setLastSuggestion(null);
      setLastSuggestionMetadata(null);

      // Reload messages
      const { data: newMessages, error: loadError } = await client
        .from('conversations')
        .select(`
          *,
          users (
            full_name,
            role
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (loadError) throw loadError;
      setMessages(newMessages || []);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setNewMessage(suggestion);
    setLastSuggestion(suggestion);
    setShowSuggestion(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
      <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Conversation</h2>

      <div className="space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No messages yet. Be the first to comment on this ticket.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.user_id === user?.id
                  ? 'bg-blue-50 dark:bg-blue-900/50 ml-4'
                  : 'bg-gray-50 dark:bg-gray-700/50 mr-4'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  {message.users?.full_name || 'Unknown User'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(message.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setShowSuggestion(!showSuggestion)}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {showSuggestion ? 'Hide AI Suggestion' : 'Get AI Suggestion'}
          </button>
        </div>

        {showSuggestion && (
          <div className="mb-4">
            <ResponseSuggestion
              ticket={ticket}
              onSuggestionSelect={handleSuggestionSelect}
            />
          </div>
        )}

        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          rows={3}
        />
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>
        )}
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
