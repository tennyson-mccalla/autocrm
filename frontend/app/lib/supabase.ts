import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

declare global {
  var supabaseInitialized: boolean;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Only log in development and only once
if (process.env.NODE_ENV === 'development' && !global.supabaseInitialized) {
  console.log('Initializing Supabase client with:', {
    url: supabaseUrl,
    key: supabaseKey?.substring(0, 10) + '...',
  });
  global.supabaseInitialized = true;
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});
