import { supabase } from './supabase';
import { Database } from '../types/supabase';
import { Ticket } from './tickets';

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

export async function getTicketsInQueue(queueId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('queue_assignments')
    .select(`
      tickets!inner(
        id,
        title,
        description,
        priority,
        created_at,
        created_by,
        status,
        updated_at
      )
    `)
    .eq('queue_id', queueId)
    .returns<{ tickets: Ticket }[]>();

  if (error) throw error;
  return data?.map(d => d.tickets) || [];
}

export async function getQueueTickets(): Promise<Ticket[]> {
  const { data: assignments, error: assignmentsError } = await supabase
    .from('queue_assignments')
    .select(`
      tickets!inner(
        id,
        title,
        description,
        priority,
        created_at,
        created_by,
        status,
        updated_at,
        assigned_to
      ),
      queues!inner(
        id,
        name,
        description
      )
    `)
    .order('created_at', { ascending: false });

  if (assignmentsError) throw assignmentsError;

  return assignments?.map(d => ({
    ...d.tickets,
    queue: d.queues
  })) as unknown as Ticket[];
}
