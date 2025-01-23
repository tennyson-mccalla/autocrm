import { createClient } from '@/lib/supabase'

export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface TicketData {
  title: string
  description: string
  priority?: TicketPriority
  status?: TicketStatus
  created_by?: string
  assigned_to?: string
  metadata?: Record<string, any>
}

export interface Ticket extends TicketData {
  id: string
  created_at: string
  updated_at: string
}

export async function createTicket(data: TicketData) {
  const supabase = createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    return { error: userError }
  }
  if (!user) {
    return { error: { message: 'Not authenticated' } }
  }

  // Validate status if provided
  if (data.status && !['open', 'in_progress', 'resolved', 'closed'].includes(data.status)) {
    return { error: { message: 'Invalid status value' } }
  }

  // Validate priority if provided
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    return { error: { message: 'Invalid priority value' } }
  }

  // Handle authorization for created_by
  if (user.user_metadata?.role === 'customer' && data.created_by && data.created_by !== user.id) {
    return { error: { message: 'Unauthorized: Customers can only create tickets for themselves' } }
  }

  // Set defaults and prepare ticket data
  const ticketData = {
    ...data,
    created_by: data.created_by || user.id,
    status: data.status || 'open',
    priority: data.priority || 'medium'
  }

  // Insert the ticket
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert([ticketData])
    .select()
    .single()

  if (error) {
    return { error }
  }

  return { data: ticket, error: null }
}

export async function getUserTickets() {
  const supabase = createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    return { error: userError }
  }
  if (!user) {
    return { error: { message: 'Not authenticated' } }
  }

  // For customers, only show their tickets
  // For workers/admins, show all tickets they have access to
  const query = supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (user.user_metadata?.role === 'customer') {
    query.eq('created_by', user.id)
  }

  const { data: tickets, error } = await query

  if (error) {
    return { error }
  }

  return { data: tickets, error: null }
}
