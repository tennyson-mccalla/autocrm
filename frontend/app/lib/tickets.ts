import { supabase } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { createSupabaseClient } from './auth';

export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export type Ticket = Database['public']['Tables']['tickets']['Row'];
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
  const client = createSupabaseClient();
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
  const client = createSupabaseClient();
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    return { error: { message: 'Not authenticated' } };
  }

  const userRole = session.user.user_metadata.role;
  let query = client.from('tickets').select('*');

  if (userRole === 'customer') {
    query = query.eq('created_by', session.user.id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
}

export async function updateTicket(id: number, updates: Partial<Ticket>) {
  const client = createSupabaseClient();
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
  const client = createSupabaseClient();
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
  const client = createSupabaseClient();
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
  const client = createSupabaseClient();
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('role', 'worker');

  if (error) {
    throw error;
  }

  return data;
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const client = createSupabaseClient();
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserTickets(
  page: number = 1,
  limit: number = 10,
  client: ReturnType<typeof createSupabaseClient> = createSupabaseClient()
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
