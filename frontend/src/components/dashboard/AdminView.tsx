'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/app/lib/auth';
import Link from 'next/link';

interface TicketStats {
  status: string;
  count: number;
  queue_id: string;
  unassigned_count: number;
  resolved_count: number;
  avg_resolution_time_hours: number;
}

interface WorkerStats {
  worker_id: string;
  email: string;
  total_assigned: number;
  total_resolved: number;
  avg_resolution_time_hours: number;
}

export default function AdminView() {
  const [ticketStats, setTicketStats] = useState<TicketStats[]>([]);
  const [workerStats, setWorkerStats] = useState<WorkerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminDashboard() {
      const supabase = createSupabaseClient();
      try {
        // Load ticket statistics using our new view
        const { data: tickets, error: ticketsError } = await supabase
          .from('ticket_statistics')
          .select('*');

        if (ticketsError) throw ticketsError;
        setTicketStats(tickets || []);

        // Load worker statistics using our new view
        const { data: workers, error: workersError } = await supabase
          .from('worker_performance')
          .select('*');

        if (workersError) throw workersError;
        setWorkerStats(workers || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadAdminDashboard();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Group ticket stats by status for the overview
  const statusOverview = ticketStats.reduce((acc, stat) => {
    acc[stat.status] = (acc[stat.status] || 0) + stat.count;
    return acc;
  }, {} as Record<string, number>);

  // Group ticket stats by queue for queue health
  const queueOverview = ticketStats.reduce((acc, stat) => {
    if (!acc[stat.queue_id]) {
      acc[stat.queue_id] = {
        total: 0,
        unassigned: 0,
        resolved: 0,
        avg_time: 0
      };
    }
    acc[stat.queue_id].total += stat.count;
    acc[stat.queue_id].unassigned += stat.unassigned_count;
    acc[stat.queue_id].resolved += stat.resolved_count;
    acc[stat.queue_id].avg_time = stat.avg_resolution_time_hours;
    return acc;
  }, {} as Record<string, { total: number; unassigned: number; resolved: number; avg_time: number; }>);

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(statusOverview).map(([status, count]) => (
            <div key={status} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">{status}</div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Health */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Queue Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(queueOverview).map(([queueId, stats]) => (
            <div key={queueId} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500 dark:text-gray-400">Queue {queueId}</div>
              <div className="text-2xl font-bold">{stats.total} total</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stats.unassigned} unassigned • {stats.resolved} resolved
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Avg. Resolution: {stats.avg_time.toFixed(1)} hours
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worker Performance */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Worker Performance</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Resolved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg. Resolution Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {workerStats.map((worker) => (
                <tr key={worker.worker_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {worker.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {worker.total_assigned}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {worker.total_resolved}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {worker.avg_resolution_time_hours?.toFixed(1) || '-'} hours
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-end space-x-4">
        <Link
          href="/admin/users"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Manage Users
        </Link>
        <Link
          href="/admin/queues"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Manage Queues
        </Link>
      </div>
    </div>
  );
}
