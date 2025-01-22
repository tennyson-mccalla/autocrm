'use client';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

export default function Home() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchTickets() {
      try {
        console.log('Fetching tickets...');
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            customer:users!tickets_created_by_fkey(full_name, email),
            agent:users!tickets_assigned_to_fkey(full_name)
          `);

        console.log('Response:', { data, error });
        if (error) throw error;
        setTickets(data || []);
      } catch (e) {
        console.error('Detailed error:', e);
        setError(e instanceof Error ? e.message : 'Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <main>
        <h1 className="text-3xl font-bold mb-8">AutoCRM Tickets</h1>

        {loading && <p className="text-gray-600">Loading tickets...</p>}

        {error && (
          <p className="text-red-500">Error: {error}</p>
        )}

        {!loading && !error && tickets.length === 0 && (
          <p className="text-gray-600">No tickets found</p>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold mb-2">{ticket.title}</h2>
                <p className="text-gray-600 mb-4">{ticket.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>Status: <span className="font-medium">{ticket.status}</span></p>
                    <p>Priority: <span className="font-medium">{ticket.priority}</span></p>
                  </div>
                  <div>
                    <p>Customer: <span className="font-medium">{ticket.customer?.full_name}</span></p>
                    <p>Agent: <span className="font-medium">{ticket.agent?.full_name || 'Unassigned'}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
