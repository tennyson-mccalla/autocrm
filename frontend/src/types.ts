export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
