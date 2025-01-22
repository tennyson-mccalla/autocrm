import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './supabase';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  customer_id: string;
  assigned_to?: string;
}

export async function createTicket(
  title: string,
  description: string,
  client: SupabaseClient = createClient()
) {
  const session = await client.auth.getSession();
  if (!session.data.session) {
    return { ticket: null, error: { message: 'Not authenticated' } };
  }

  const { data: ticket, error } = await client
    .from('tickets')
    .insert({
      title,
      description,
      status: 'open',
      customer_id: session.data.session.user.id
    })
    .select()
    .single();

  return { ticket, error };
}

export async function listTickets(
  client: SupabaseClient = createClient()
) {
  const session = await client.auth.getSession();
  if (!session.data.session) {
    return { tickets: null, error: { message: 'Not authenticated' } };
  }

  const role = session.data.session.user.user_metadata.role;
  let query = client.from('tickets').select('*');

  // Customers can only see their own tickets
  if (role === 'customer') {
    query = query.eq('customer_id', session.data.session.user.id);
  }

  const { data: tickets, error } = await query.then();
  return { tickets, error: error || null };
}

export async function updateTicketStatus(
  ticketId: string,
  status: Ticket['status'],
  client: SupabaseClient = createClient()
) {
  const session = await client.auth.getSession();
  if (!session.data.session) {
    return { ticket: null, error: { message: 'Not authenticated' } };
  }

  const role = session.data.session.user.user_metadata.role;
  if (role === 'customer') {
    return { ticket: null, error: { message: 'Unauthorized' } };
  }

  const { data: ticket, error } = await client
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single();

  return { ticket, error };
}

export async function assignTicket(
  ticketId: string,
  workerId: string,
  client: SupabaseClient = createClient()
) {
  const session = await client.auth.getSession();
  if (!session.data.session) {
    return { ticket: null, error: { message: 'Not authenticated' } };
  }

  const role = session.data.session.user.user_metadata.role;
  if (role !== 'admin') {
    return { ticket: null, error: { message: 'Unauthorized' } };
  }

  // Verify worker exists and has worker role
  const { data: worker } = await client
    .from('users')
    .select('role')
    .eq('id', workerId)
    .single();

  if (!worker || worker.role !== 'worker') {
    return { ticket: null, error: { message: 'Invalid worker assignment' } };
  }

  const { data: ticket, error } = await client
    .from('tickets')
    .update({
      assigned_to: workerId,
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId)
    .select()
    .single();

  return { ticket, error };
}
