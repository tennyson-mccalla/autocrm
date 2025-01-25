'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Ticket } from '@/app/lib/tickets';
import { getQueueTickets, Queue, createQueue, getQueues, getTicketsInQueue } from '@/app/lib/queues';

export default function QueuesPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newQueueName, setNewQueueName] = useState('');
  const [newQueueDescription, setNewQueueDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadQueues();
  }, []);

  useEffect(() => {
    if (selectedQueue) {
      loadTickets(selectedQueue.id);
    }
  }, [selectedQueue]);

  useEffect(() => {
    const loadQueueTickets = async () => {
      if (user?.user_metadata.role === 'worker' || user?.user_metadata.role === 'admin') {
        try {
          const queueTickets = await getQueueTickets();
          setTickets(queueTickets);
          setError(null);
        } catch (err) {
          console.error('Error loading queue tickets:', err);
          setError('Failed to load tickets');
          setTickets([]);
        }
      }
    };

    loadQueueTickets();
  }, [user]);

  async function loadQueues() {
    try {
      const data = await getQueues();
      setQueues(data);
      if (data.length > 0 && !selectedQueue) {
        setSelectedQueue(data[0]);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading queues:', error);
      setError('Failed to load queues');
      setQueues([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadTickets(queueId: string) {
    try {
      const data = await getTicketsInQueue(queueId);
      setTickets(data);
      setError(null);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setError('Failed to load tickets for this queue');
      setTickets([]);
    }
  }

  async function handleCreateQueue(e: React.FormEvent) {
    e.preventDefault();
    if (!newQueueName.trim()) return;

    try {
      const queue = await createQueue(newQueueName, newQueueDescription);
      setQueues(prev => [...prev, queue]);
      setNewQueueName('');
      setNewQueueDescription('');
    } catch (error) {
      console.error('Error creating queue:', error);
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading queues...</div>;
  }

  if (!user || user.user_metadata.role === 'customer') {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex space-x-8">
          {/* Queue List */}
          <div className="w-1/4">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Create Queue</h2>
              <form onSubmit={handleCreateQueue} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={newQueueName}
                    onChange={(e) => setNewQueueName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={newQueueDescription}
                    onChange={(e) => setNewQueueDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Queue
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Queues</h2>
              <div className="space-y-2">
                {queues.map((queue) => (
                  <button
                    key={queue.id}
                    onClick={() => setSelectedQueue(queue)}
                    className={`w-full text-left px-4 py-2 rounded ${
                      selectedQueue?.id === queue.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="font-medium">{queue.name}</div>
                    {queue.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{queue.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket List */}
          <div className="w-3/4">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                {selectedQueue ? `Tickets in ${selectedQueue.name}` : 'Select a queue'}
              </h2>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => window.location.href = `/tickets/${ticket.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{ticket.title}</h3>
                      <span className={`px-2 py-1 text-sm rounded ${
                        ticket.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{ticket.description}</p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    No tickets in this queue
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
