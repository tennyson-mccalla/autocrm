import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getSupabaseClient() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createRouteHandlerClient({ cookies });
  }
  throw new Error('Supabase environment variables are not set');
}

export async function getSupabaseSession() {
  const supabase = await getSupabaseClient();
  return supabase.auth.getSession();
}

export async function getSupabaseUser() {
  const supabase = await getSupabaseClient();
  return supabase.auth.getUser();
}
