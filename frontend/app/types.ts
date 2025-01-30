export type TicketStatus = 'new' | 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  metadata?: Record<string, any>;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  queue_assignments?: Array<{
    id: string;
    queue_id: string;
    queues?: {
      id: string;
      name: string;
    };
  }>;
  conversation_count?: number;
  assigned_to_user?: {
    full_name: string;
  };
}

export interface Conversation {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  internal_note: boolean;
  created_at: string;
  users?: {
    full_name: string;
    role: UserRole;
  };
}
