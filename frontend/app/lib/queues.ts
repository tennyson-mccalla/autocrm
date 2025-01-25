import { Database } from '../types/supabase';
import { Ticket } from './tickets';
import { supabase } from '../lib/supabase';

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
    .select('*')
    .eq('ticket_id', ticketId);

  if (error) {
    console.error('Error getting queue assignments:', error);
    return null;
  }

  return data;
}

export async function getTicketsInQueue(queueId: string) {
  const { data, error } = await supabase
    .from('queue_assignments')
    .select(`
      *,
      tickets (
        id,
        title,
        description,
        status,
        priority,
        created_by,
        assigned_to
      )
    `)
    .eq('queue_id', queueId);

  if (error) {
    console.error('Error getting tickets in queue:', error);
    return null;
  }

  return data?.map(assignment => assignment.tickets);
}

export async function getQueueTickets() {
  const { data, error } = await supabase
    .from('queue_assignments')
    .select(`
      *,
      tickets (
        id,
        title,
        description,
        status,
        priority,
        created_by,
        assigned_to
      )
    `);

  if (error) {
    console.error('Error getting queue tickets:', error);
    return null;
  }

  return data?.map(assignment => assignment.tickets);
}
