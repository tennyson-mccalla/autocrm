'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function getSupabaseClient() {
  return createClientComponentClient();
}

export async function getSupabaseSession() {
  const supabase = getSupabaseClient();
  return supabase.auth.getSession();
}

export async function getSupabaseUser() {
  const supabase = getSupabaseClient();
  return supabase.auth.getUser();
}
