import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

let client: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export const createClient = () => {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  client = createSupabaseClient<Database>(supabaseUrl, supabaseKey);
  return client;
};
