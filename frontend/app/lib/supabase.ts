import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/supabase';

// Create a single instance of the Supabase client for client components
export const supabase = createClientComponentClient<Database>({
  cookieOptions: {
    name: 'sb-localhost-auth-token',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  }
});

// Helper function to get the current session
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

// Helper function to get the current user
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}
