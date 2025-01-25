'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/app/lib/auth';
import { Ticket } from '@/app/types';
import Link from 'next/link';

interface WorkerViewProps {
  userId: string;
}

export default function WorkerView({ userId }: WorkerViewProps) {
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [queueStats, setQueueStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      const supabase = createSupabaseClient();
      try {
        // Load assigned tickets
        const { data: tickets, error: ticketsError } = await supabase
          .from('tickets')
          .select('*')
          .eq('assigned_to', userId)
          .order('updated_at', { ascending: false });

        if (ticketsError) throw ticketsError;
        setAssignedTickets(tickets || []);

        // Load queue statistics
        const { data: queueData, error: queueError } = await supabase
          .from('tickets')
          .select('queue_id, status')
          .is('assigned_to', null);

        if (queueError) throw queueError;

        // Calculate queue stats
        const stats = (queueData || []).reduce((acc, ticket) => {
          acc[ticket.queue_id] = (acc[ticket.queue_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setQueueStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [userId]);

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const ticketsByStatus = assignedTickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Tickets</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(ticketsByStatus).map(([status, count]) => (
            <div key={status} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">{status}</div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Queue Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(queueStats).map(([queueId, count]) => (
            <div key={queueId} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">Queue {queueId}</div>
              <div className="text-2xl font-bold">{count} unassigned</div>
            </div>
          ))}
        </div>
      </div>

      {/* View Queue Button */}
      <div className="flex justify-end">
        <Link
          href="/tickets/queue"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          View Queue
        </Link>
      </div>

      {/* Assigned Tickets */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Assigned Tickets</h2>
        <div className="space-y-4">
          {assignedTickets.length === 0 ? (
            <p>No tickets assigned. Check the queue for available tickets.</p>
          ) : (
            assignedTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{ticket.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      ticket.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                      ticket.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      ticket.status === 'new' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                      ticket.status === 'open' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                      ticket.status === 'in_progress' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      ticket.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                      'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Updated: {new Date(ticket.updated_at).toLocaleDateString()}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
