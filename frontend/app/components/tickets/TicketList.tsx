'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { listTickets, Ticket } from '../../lib/tickets';
import { Pagination } from '../common/Pagination';

export function TicketList() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  async function fetchTickets() {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('Please sign in to view tickets');
        return;
      }

      const { data, error: ticketError } = await listTickets();

      if (ticketError) {
        setError(ticketError.message);
        return;
      }

      setTickets(data || []);
    } catch (err) {
      setError('Error loading tickets');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, [user]);

  // Refresh tickets every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) fetchTickets();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleTicketClick = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view tickets</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">No tickets found</p>
      </div>
    );
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = tickets.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {paginatedTickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => handleTicketClick(ticket.id)}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{ticket.title}</h3>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-sm ${
                ticket.status === 'open' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                ticket.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}>
                {ticket.status}
              </span>
              {ticket.assigned_to && (
                <span className="px-2 py-1 rounded text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  {ticket.assigned_to === user?.id ? 'Assigned to me' : 'Assigned'}
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{ticket.description}</p>
          <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${
                ticket.priority === 'high' ? 'bg-red-500' :
                ticket.priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`} />
              <span>{ticket.priority} priority</span>
            </div>
            <time dateTime={ticket.created_at}>
              {new Date(ticket.created_at).toLocaleDateString()}
            </time>
          </div>
        </div>
      ))}

      <Pagination
        currentPage={currentPage}
        totalItems={tickets.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
