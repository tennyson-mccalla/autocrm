import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Initializing Supabase client with:', {
  url: supabaseUrl,
  key: supabaseKey?.substring(0, 10) + '...',
});

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  },
});
