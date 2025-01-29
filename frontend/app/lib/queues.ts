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
  try {
    // First try to use the RPC function
    const { data, error } = await supabase
      .rpc('assign_ticket_to_queue', {
        _ticket_id: ticketId,
        _queue_id: queueId,
      });

    // If we get a duplicate key error (409), the assignment already exists
    if (error?.code === '23505') {
      // Get the existing assignment
      const { data: existingAssignment } = await supabase
        .from('queue_assignments')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('queue_id', queueId)
        .single();

      return existingAssignment;
    }

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating queue assignment:', error);
    throw error;
  }
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

export async function getTicketsInQueue(queueId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('queue_assignments')
    .select(`
      ticket_id,
      tickets (
        id,
        title,
        description,
        status,
        priority,
        created_by,
        assigned_to,
        created_at,
        updated_at
      )
    `)
    .eq('queue_id', queueId);

  if (error) {
    console.error('Error getting tickets in queue:', error);
    return [];
  }

  // Remove duplicates and null entries
  const tickets = data
    ?.map(assignment => assignment.tickets)
    .filter((ticket): ticket is NonNullable<typeof ticket> => ticket !== null);

  // Remove duplicates by ticket ID
  const uniqueTickets = Array.from(
    new Map(tickets.map(ticket => [ticket.id, ticket])).values()
  );

  return uniqueTickets;
}

export async function getQueueTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('queue_assignments')
    .select(`
      ticket_id,
      tickets (
        id,
        title,
        description,
        status,
        priority,
        created_by,
        assigned_to,
        created_at,
        updated_at
      )
    `);

  if (error) {
    console.error('Error getting queue tickets:', error);
    return [];
  }

  // Remove duplicates and null entries
  const tickets = data
    ?.map(assignment => assignment.tickets)
    .filter((ticket): ticket is NonNullable<typeof ticket> => ticket !== null);

  // Remove duplicates by ticket ID
  const uniqueTickets = Array.from(
    new Map(tickets.map(ticket => [ticket.id, ticket])).values()
  );

  return uniqueTickets;
}
