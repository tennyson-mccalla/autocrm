'use client';

import { useState, useEffect } from 'react';
import { getQueues, Queue, getQueueAssignments, assignTicketToQueue } from '../../lib/queues';

export default function QueueSelector({ ticketId }: { ticketId: string }) {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugState, setDebugState] = useState<string>('initial');

  // Debug effect
  useEffect(() => {
    console.log('QueueSelector Debug:', {
      ticketId,
      queuesCount: queues.length,
      currentAssignments,
      loading,
      error,
      debugState
    });
  }, [ticketId, queues, currentAssignments, loading, error, debugState]);

  // Load queues and assignments only once when component mounts
  useEffect(() => {
    let mounted = true;
    setDebugState('effect-started');

    async function loadData() {
      if (!ticketId) {
        setDebugState('no-ticket-id');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setDebugState('loading-data');

        console.log('Fetching queues and assignments for ticket:', ticketId);
        const [queuesList, assignments] = await Promise.all([
          getQueues(),
          getQueueAssignments(ticketId)
        ]);

        if (!mounted) {
          setDebugState('unmounted');
          return;
        }

        if (queuesList) {
          console.log('Queues loaded:', queuesList);
          setQueues(queuesList);
        }

        if (assignments) {
          console.log('Queue assignments loaded:', assignments);
          setCurrentAssignments(assignments.map(a => a.queue_id));
        }

        setDebugState('data-loaded');
      } catch (error) {
        console.error('Error loading queues:', error);
        if (mounted) {
          setError('Failed to load queues');
          setDebugState('error-occurred');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setDebugState('loading-complete');
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
      setDebugState('cleanup');
    };
  }, [ticketId]);

  const handleQueueToggle = async (queueId: string) => {
    try {
      setDebugState('toggling-queue');
      setError(null);
      console.log('Toggling queue assignment:', { ticketId, queueId });

      await assignTicketToQueue(ticketId, queueId);

      setCurrentAssignments(prev => {
        const newAssignments = prev.includes(queueId)
          ? prev.filter(id => id !== queueId)
          : [...prev, queueId];
        console.log('Updated assignments:', newAssignments);
        return newAssignments;
      });

      setDebugState('queue-toggled');
    } catch (error) {
      console.error('Error updating queue assignment:', error);
      setError('Failed to update queue assignment');
      setDebugState('toggle-error');
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="text-sm text-gray-500 mt-2">State: {debugState}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <p className="text-sm text-gray-500 mt-2">State: {debugState}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Queues</h3>
        <span className="text-xs text-gray-500">State: {debugState}</span>
      </div>
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
