'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { assignTicket, getWorkers } from '../../lib/tickets';

interface Worker {
  id: string;
  email: string;
}

export default function AssignTicket({ ticketId }: { ticketId: string }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchWorkers() {
      try {
        const workersData = await getWorkers();
        setWorkers(workersData);
      } catch (error) {
        console.error('Error fetching workers:', error);
      }
    }

    if (user?.user_metadata?.role === 'admin') {
      fetchWorkers();
    }
  }, [user]);

  const handleAssign = async (assignedTo: string) => {
    try {
      setLoading(true);
      await assignTicket(ticketId, assignedTo);
      // Trigger a page refresh after successful assignment
      router.refresh();
    } catch (error) {
      console.error('Error assigning ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfAssign = async () => {
    if (!user) return;
    await handleAssign(user.id);
  };

  if (!user) return null;

  // For workers, show self-assign button
  if (user.user_metadata.role === 'worker') {
    return (
      <div className="mt-4">
        <button
          onClick={handleSelfAssign}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Assigning...' : 'Assign to Myself'}
        </button>
      </div>
    );
  }

  // For admins, show worker selection
  if (user.user_metadata.role === 'admin') {
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Assign to Worker</h3>
        <div className="flex flex-wrap gap-2">
          {workers.map((worker) => (
            <button
              key={worker.id}
              onClick={() => handleAssign(worker.id)}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : `Assign to ${worker.email}`}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
