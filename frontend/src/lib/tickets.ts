import { createClient } from '@/lib/supabase'
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

export async function createTicket(ticket: NewTicket) {
  const client = createSupabaseClient();
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    return { error: { message: 'Not authenticated' } };
  }

  const { data, error } = await client
    .from('tickets')
    .insert([{ ...ticket, created_by: session.user.id }])
    .select()
    .single();

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
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
    query = query.eq('user_id', session.user.id);
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

export async function assignTicket(ticketId: number, workerId: string) {
  const client = createSupabaseClient();
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    return { error: { message: 'Not authenticated' } };
  }

  const userRole = session.user.user_metadata.role;
  if (userRole === 'customer') {
    return { error: { message: 'Unauthorized' } };
  }

  // Verify the worker exists and has the correct role
  const { data: workerData, error: workerError } = await client
    .from('users')
    .select('role')
    .eq('id', workerId)
    .single();

  if (workerError || !workerData || workerData.role !== 'worker') {
    return { error: { message: 'Invalid worker ID' } };
  }

  const { data, error } = await client
    .from('tickets')
    .update({ assigned_to: workerId, status: 'in_progress' })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
}

export async function getTicket(id: string) {
  const client = createSupabaseClient();
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError || !session) {
    return { error: { message: 'Not authenticated' } };
  }

  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { error: { message: error.message } };
  }

  return { data };
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
