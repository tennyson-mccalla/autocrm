export interface User {
  id: string;
  email: string;
  role: 'customer' | 'worker' | 'admin';
  created_at: string;
  updated_at: string;
}

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
