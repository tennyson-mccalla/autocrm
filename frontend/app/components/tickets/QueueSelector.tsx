'use client';

import { useState, useEffect } from 'react';
import { getQueues, Queue, getQueueAssignments, assignTicketToQueue } from '../../lib/queues';

export default function QueueSelector({ ticketId }: { ticketId: string }) {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [queuesList, assignments] = await Promise.all([
          getQueues(),
          getQueueAssignments(ticketId)
        ]);
        setQueues(queuesList || []);
        setCurrentAssignments((assignments || []).map(a => a.queue_id));
      } catch (error) {
        console.error('Error loading queues:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [ticketId]);

  async function handleQueueToggle(queueId: string) {
    try {
      await assignTicketToQueue(ticketId, queueId);
      setCurrentAssignments(prev =>
        prev.includes(queueId)
          ? prev.filter(id => id !== queueId)
          : [...prev, queueId]
      );
    } catch (error) {
      console.error('Error updating queue assignment:', error);
    }
  }

  if (loading) {
    return <div className="animate-pulse text-gray-600 dark:text-gray-400">Loading queues...</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Queues</h3>
      <div className="flex flex-wrap gap-2">
        {queues.map((queue) => (
          <button
            key={queue.id}
            onClick={() => handleQueueToggle(queue.id)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              currentAssignments.includes(queue.id)
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {queue.name}
          </button>
        ))}
      </div>
    </div>
  );
}
