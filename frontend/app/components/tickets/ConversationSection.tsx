import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createSupabaseClient } from '../../lib/auth';
import type { Conversation } from '../../types';

interface ConversationSectionProps {
  ticketId: string;
}

export default function ConversationSection({ ticketId }: ConversationSectionProps) {
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();
  }, [ticketId]);

  async function loadMessages() {
    try {
      const client = createSupabaseClient();
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
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const client = createSupabaseClient();
      const { error } = await client
        .from('conversations')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message: newMessage.trim(),
          internal_note: false
        });

      if (error) throw error;

      setNewMessage('');
      loadMessages(); // Reload messages to show the new one
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }

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
