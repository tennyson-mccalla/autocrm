import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getSupabaseServerClient() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createRouteHandlerClient({ cookies });
  }
  throw new Error('Supabase environment variables are not set');
}

export async function getSupabaseServerSession() {
  const supabase = await getSupabaseServerClient();
  return supabase.auth.getSession();
}

export async function getSupabaseServerUser() {
  const supabase = await getSupabaseServerClient();
  return supabase.auth.getUser();
}
