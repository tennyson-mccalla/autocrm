import { getSupabaseClient } from './supabase/client';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../types/supabase';

export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  created_by: string;
  status: 'open' | 'in_progress' | 'closed';
  updated_at: string;
  assigned_to?: string;
  queue_assignments?: Array<{
    id: string;
    queue_id: string;
    queues?: {
      id: string;
      name: string;
    };
  }>;
  conversations?: Array<{
    count: number;
  }>;
  assigned_to_user?: {
    full_name: string;
  };
}

export type NewTicket = Omit<Ticket, 'id' | 'created_at' | 'updated_at'>;

export interface TicketData {
  title: string
  description: string
  priority?: TicketPriority
  status?: TicketStatus
  created_by?: string
  assigned_to?: string
  metadata?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[] | null;
  count: number;
  error: any;
}

export type TicketInput = Pick<Ticket, 'title' | 'description' | 'priority'>;

export async function createTicket(ticket: TicketInput): Promise<{ data: Ticket | null; error: { message: string } | null }> {
  const client = getSupabaseClient();
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    return { data: null, error: { message: 'Not authenticated' } };
  }

  const { data, error } = await client
    .from('tickets')
    .insert([{
      ...ticket,
      created_by: session.user.id,
      status: 'open' as const
    }])
    .select()
    .single();

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

export async function listTickets() {
  const client = getSupabaseClient();
  let conversations: Conversation[] = [];
  let queueAssignments: QueueAssignment[] = [];

  // Fetch tickets with user info
  const { data: tickets, error } = await client
    .from('tickets')
    .select(`
      *,
      created_by_user:users!tickets_created_by_fkey(full_name, email),
      assigned_to_user:users!tickets_assigned_to_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    return { error };
  }

  // Fetch queue assignments for all users
  try {
    const { data: qa, error: qaError } = await client
      .from('queue_assignments')
      .select(`
        queue_id,
        ticket_id,
        queues (
          id,
          name,
          description
        )
      `);

    if (!qaError && qa) {
      queueAssignments = qa;
    }
  } catch (error) {
    console.error('Queue assignments error:', error);
  }

  // Fetch conversation counts for all users
  try {
    const { data: conv, error: convoError } = await client
      .rpc('count_conversations_per_ticket');

    if (!convoError && conv) {
      conversations = conv as Conversation[];
    }
  } catch (error) {
    console.error('Conversations error:', error);
  }

  // Combine the data
  const enrichedTickets = tickets?.map(ticket => ({
    ...ticket,
    queue_assignments: queueAssignments
      .filter(qa => qa.ticket_id === ticket.id)
      .map(qa => ({
        queue_id: qa.queue_id,
        queues: qa.queues?.[0] || null
      })) || [],
    conversation_count: conversations.find(c => c.ticket_id === ticket.id)?.count || 0
  }));

  return { data: enrichedTickets };
}

export async function updateTicket(id: number, updates: Partial<Ticket>) {
  const client = getSupabaseClient();
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    return { error: { message: 'Not authenticated' } };
  }

  const userRole = session.user.user_metadata.role;
  if (userRole === 'customer') {
    return { error: { message: 'Unauthorized' } };
  }

  const { data, error } = await client
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
}

export async function getUnassignedTickets() {
  const client = getSupabaseClient();
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    return { error: { message: 'Not authenticated' } };
  }

  const userRole = session.user.user_metadata.role;
  if (userRole === 'customer') {
    return { error: { message: 'Unauthorized' } };
  }

  const { data, error } = await client
    .from('tickets')
    .select('*')
    .is('assigned_to', null)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
}

export async function assignTicket(ticketId: string, assignedTo: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('tickets')
    .update({ assigned_to: assignedTo })
    .eq('id', ticketId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function getWorkers() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('id, email, full_name')
    .eq('role', 'worker');

  if (error) {
    throw error;
  }

  return data;
}

interface QueueAssignment {
  ticket_id: string;
  queue_id: string;
  queues?: {
    id: string;
    name: string;
  }[];
}

interface Conversation {
  ticket_id: string;
  count: number;
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const client = getSupabaseClient();
  console.log('Getting session for ticket:', id);
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    console.error('Session error:', sessionError);
    throw new Error('Not authenticated');
  }

  const userRole = session.user.user_metadata.role;
  console.log('User role:', userRole);

  // Fetch ticket with basic info and assigned user
  console.log('Fetching ticket data...');
  const { data: ticket, error: ticketError } = await client
    .from('tickets')
    .select(`
      *,
      assigned_to_user:users!tickets_assigned_to_fkey (
        full_name
      )
    `)
    .eq('id', id)
    .single();

  if (ticketError) {
    console.error('Error fetching ticket:', ticketError);
    throw ticketError;
  }

  if (!ticket) {
    console.log('No ticket found with id:', id);
    return null;
  }

  console.log('Basic ticket data retrieved:', ticket);

  let queueAssignments: QueueAssignment[] = [];
  let conversations: Conversation[] = [];

  // Only fetch queue assignments for workers and admins
  if (userRole === 'worker' || userRole === 'admin') {
    try {
      console.log('Fetching queue assignments...');
      const { data: qa, error: queueError } = await client
        .from('queue_assignments')
        .select(`
          ticket_id,
          queue_id,
          queues (
            id,
            name
          )
        `)
        .eq('ticket_id', id);

      if (!queueError && qa) {
        queueAssignments = qa as QueueAssignment[];
        console.log('Queue assignments retrieved:', queueAssignments);
      } else if (queueError) {
        console.error('Error fetching queue assignments:', queueError);
      }
    } catch (error) {
      console.error('Queue assignments error:', error);
    }
  }

  // Fetch conversation count
  try {
    console.log('Fetching conversation counts...');
    const { data: conv, error: convoError } = await client
      .rpc('count_conversations_per_ticket')
      .eq('ticket_id', id);

    if (!convoError && conv) {
      conversations = conv as Conversation[];
      console.log('Conversation counts retrieved:', conversations);
    } else if (convoError) {
      console.error('Error fetching conversation counts:', convoError);
    }
  } catch (error) {
    console.error('Conversations error:', error);
  }

  // Combine the data
  const enrichedTicket = {
    ...ticket,
    queue_assignments: queueAssignments.map(qa => ({
      queue_id: qa.queue_id,
      queues: qa.queues?.[0] || null
    })) || [],
    conversation_count: conversations.find((c: Conversation) => c.ticket_id === id)?.count || 0
  };

  console.log('Returning enriched ticket:', enrichedTicket);
  return enrichedTicket;
}

export async function getUserTickets(
  page: number = 1,
  limit: number = 10,
  client: ReturnType<typeof getSupabaseClient> = getSupabaseClient()
): Promise<PaginatedResponse<Ticket>> {
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError) {
    return { data: null, count: 0, error: sessionError };
  }
  if (!session) {
    return { data: null, count: 0, error: { message: 'Not authenticated' } };
  }

  const user = session.user;
  const userRole = user.user_metadata?.role;

  // Calculate offset
  const offset = (page - 1) * limit;

  // Build base query
  let query = client
    .from('tickets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (userRole === 'customer') {
    query = query.eq('created_by', user.id);
  }

  const { data: tickets, error, count } = await query;

  if (error) {
    return { data: null, count: 0, error };
  }

  return { data: tickets, count: count || 0, error: null };
}
