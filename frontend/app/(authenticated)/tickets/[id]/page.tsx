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
  const { user, loading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugState, setDebugState] = useState<string>('initial');

  // Debug effect for state changes
  useEffect(() => {
    console.log('State Debug:', {
      authLoading,
      loading,
      error,
      debugState,
      hasUser: !!user,
      userId: user?.id,
      userRole: user?.user_metadata?.role,
      ticketId: params.id
    });
  }, [authLoading, loading, error, debugState, user, params.id]);

  useEffect(() => {
    let mounted = true;
    setDebugState('effect-started');

    async function loadTicket() {
      if (!user || !params.id) {
        setDebugState('no-user-or-params');
        return;
      }

      try {
        setDebugState('fetching-ticket');
        setLoading(true);
        const ticketData = await getTicket(params.id);

        if (!mounted) {
          setDebugState('unmounted');
          return;
        }

        if (ticketData) {
          setDebugState('ticket-received');
          setTicket(ticketData);
          setError(null);
        } else {
          setDebugState('no-ticket-found');
          setError('Ticket not found');
          setTicket(null);
        }
      } catch (error) {
        if (!mounted) return;
        setDebugState('error-occurred');
        console.error('Error fetching ticket:', error);
        setError(error instanceof Error ? error.message : 'Failed to load ticket');
        setTicket(null);
      } finally {
        if (mounted) {
          setDebugState('loading-complete');
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadTicket();
    } else {
      setDebugState('waiting-for-auth');
    }

    return () => {
      mounted = false;
      setDebugState('cleanup');
    };
  }, [params.id, user, authLoading]);

  function handleBack() {
    router.push('/tickets');
  }

  // Show loading state while checking auth or loading ticket
  if (authLoading || loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
        <div className="text-sm text-gray-500">Current state: {debugState}</div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
        <p className="text-red-600 dark:text-red-400">Please log in to view this ticket</p>
        <p className="text-sm mt-2">Debug state: {debugState}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <p className="text-sm mt-2">Debug state: {debugState}</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
        <p className="text-yellow-600 dark:text-yellow-400">Ticket not found</p>
        <p className="text-sm mt-2">Debug state: {debugState}</p>
      </div>
    );
  }

  // Convert Ticket to TicketContext for AI suggestions
  const ticketContext: TicketContext = {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    customerEmail: ticket.created_by
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tickets
        </button>
        <div className="text-sm text-gray-500">State: {debugState}</div>
      </div>

      <div className="p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{ticket.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
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

          <ConversationSection ticketId={ticket.id} ticket={ticketContext} />
        </div>
      </div>
    </div>
  );
}
