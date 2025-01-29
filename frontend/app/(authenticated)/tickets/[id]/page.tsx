'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getTicket, Ticket } from '@/app/lib/tickets';
import QueueSelector from '@/app/components/tickets/QueueSelector';
import AssignTicket from '@/app/components/tickets/AssignTicket';
import ConversationSection from '@/app/components/tickets/ConversationSection';
import { TicketContext } from '@/app/types/llm-responses';

export default function TicketPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const ticketData = await getTicket(params.id);
        setTicket(ticketData);
        setError(null);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setError(error instanceof Error ? error.message : 'Failed to load ticket');
        setTicket(null);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchTicket();
    }
  }, [params.id, user]);

  function handleBack() {
    router.push('/tickets');
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  // Convert Ticket to TicketContext for AI suggestions
  const ticketContext: TicketContext = {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    customerEmail: ticket.created_by, // Using created_by as customer email for now
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tickets
      </button>

      <div className="p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-semibold">{ticket.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
              ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {ticket.status}
            </span>
          </div>

          <QueueSelector ticketId={ticket.id} />
          <AssignTicket ticketId={ticket.id} />

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
            <div>
              <h2 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-4">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  ticket.priority === 'high' ? 'bg-red-500' :
                  ticket.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <span>{ticket.priority} priority</span>
              </div>
              <time dateTime={ticket.created_at}>
                Created: {new Date(ticket.created_at).toLocaleDateString()}
              </time>
            </div>
          </div>

          {/* Conversation Section */}
          <ConversationSection ticketId={ticket.id} ticket={ticketContext} />
        </div>
      </div>
    </div>
  );
}
