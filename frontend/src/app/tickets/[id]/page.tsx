'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { getTicket, Ticket } from '../../../lib/tickets';
import QueueSelector from '@/components/tickets/QueueSelector';
import Navigation from '@/components/Navigation';
import AssignTicket from '@/components/tickets/AssignTicket';

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

  return (
    <div>
      <Navigation />
      
      <div className="p-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tickets
          </button>

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

          <div className="bg-white shadow rounded-lg p-6 mt-4">
            <div>
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
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
          <div className="bg-white shadow rounded-lg p-6 mt-4">
            <h2 className="text-lg font-medium mb-4">Conversation</h2>
            <div className="space-y-4">
              {/* Placeholder for future conversation implementation */}
              <div className="text-gray-500 text-center py-4">
                No messages yet. Be the first to comment on this ticket.
              </div>
              <div className="mt-4">
                <textarea
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
