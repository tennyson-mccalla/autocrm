import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Queue = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type QueueAssignment = {
  id: string;
  queue_id: string;
  ticket_id: string;
  assigned_at: string;
  assigned_by: string;
};

export async function createQueue(name: string, description?: string) {
  const { data, error } = await supabase
    .from('queues')
    .insert([{ name, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQueues() {
  const { data, error } = await supabase
    .from('queues')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function assignTicketToQueue(ticketId: string, queueId: string) {
  const { data, error } = await supabase
    .rpc('assign_ticket_to_queue', {
      _ticket_id: ticketId,
      _queue_id: queueId,
    });

  if (error) throw error;
  return data;
}

export async function getQueueAssignments(ticketId: string) {
  const { data, error } = await supabase
    .from('queue_assignments')
    .select(`
      *,
      queue:queues(*)
    `)
    .eq('ticket_id', ticketId);

  if (error) throw error;
  return data;
}

export async function getTicketsInQueue(queueId: string) {
  const { data, error } = await supabase
    .from('queue_assignments')
    .select(`
      ticket_id,
      ticket:tickets(*)
    `)
    .eq('queue_id', queueId);

  if (error) throw error;
  return data?.map(d => d.ticket);
}
