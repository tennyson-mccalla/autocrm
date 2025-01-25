'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/app/lib/auth';
import { Ticket } from '@/app/types';
import Link from 'next/link';

interface CustomerViewProps {
  userId: string;
}

export default function CustomerView({ userId }: CustomerViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      const supabase = createSupabaseClient();
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('created_by', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [userId]);

  if (loading) {
    return <div className="animate-pulse">Loading your tickets...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const ticketsByStatus = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(ticketsByStatus).map(([status, count]) => (
          <div key={status} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">{status}</div>
            <div className="text-2xl font-bold">{count}</div>
          </div>
        ))}
      </div>

      {/* Create Ticket Button */}
      <div className="flex justify-end">
        <Link
          href="/tickets/new"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Create New Ticket
        </Link>
      </div>

      {/* Recent Tickets */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Tickets</h2>
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <p>No tickets found. Create one to get started!</p>
          ) : (
            tickets.map((ticket) => (
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
                  Created: {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
