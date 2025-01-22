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
