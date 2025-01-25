import { supabase } from './supabase';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseClient() {
  return supabase;
}

type UserRole = 'admin' | 'worker' | 'customer';

export async function signUpUser(
  email: string,
  password: string,
  role: UserRole,
  client: typeof supabase = createSupabaseClient()
) {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { role }
    }
  });

  if (error) {
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

export async function signInUser(
  email: string,
  password: string,
  client: typeof supabase = createSupabaseClient()
) {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

export async function signOutUser(
  client: typeof supabase = createSupabaseClient()
) {
  const { error } = await client.auth.signOut();
  return { error };
}

export async function getCurrentUser(
  client: typeof supabase = createSupabaseClient()
) {
  const { data: { session }, error } = await client.auth.getSession();
  
  if (error || !session) {
    return { user: null, error: error || { message: 'No session found' } };
  }
  
  return { user: session.user, error: null };
}

export async function getUserProfile(
  userId: string,
  client: typeof supabase = createSupabaseClient()
) {
  if (!userId) {
    return { user: null, error: { message: 'User ID is required' } };
  }

  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session) {
    return { user: null, error: sessionError || { message: 'Not authenticated' } };
  }

  const userRole = session.user.user_metadata.role;

  const { data: user, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { user: null, error };
  }
  if (!user) {
    return { user: null, error: { message: 'User not found' } };
  }

  if (userRole === 'customer' && user.id !== session.user.id) {
    return { user: null, error: { message: 'Unauthorized' } };
  }

  return { user, error: null };
}

export async function listAllUsers(
  client: typeof supabase = createSupabaseClient()
) {
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session) {
    return { users: null, error: sessionError || { message: 'No session found' } };
  }

  if (session.user.user_metadata?.role !== 'admin') {
    return { users: null, error: { message: 'Unauthorized' } };
  }

  const { data: users, error } = await client
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { users: null, error };
  }

  return { users, error: null };
}

export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    metadata?: Record<string, any>;
  },
  client: typeof supabase = createSupabaseClient()
) {
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session) {
    return { user: null, error: sessionError || { message: 'No session found' } };
  }

  const currentUser = session.user;
  const isAdmin = currentUser.user_metadata?.role === 'admin';
  const isOwnProfile = currentUser.id === userId;

  if (!isAdmin && !isOwnProfile) {
    return { user: null, error: { message: 'Unauthorized' } };
  }

  // Validate full name length
  if (updates.full_name && updates.full_name.length > 100) {
    return { user: null, error: { message: 'Full name is too long' } };
  }

  // Validate metadata
  if (updates.metadata) {
    try {
      JSON.stringify(updates.metadata);
    } catch (err) {
      return { user: null, error: { message: 'Invalid metadata format' } };
    }
  }

  const { data: user, error } = await client
    .from('users')
    .update(updates)
    .eq('id', userId)
    .single();

  if (error) {
    return { user: null, error };
  }

  return { user, error: null };
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  client: typeof supabase = createSupabaseClient()
) {
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session) {
    return { user: null, error: sessionError || { message: 'No session found' } };
  }

  if (session.user.user_metadata?.role !== 'admin') {
    return { user: null, error: { message: 'Only admins can change user roles' } };
  }

  if (!['admin', 'worker', 'customer'].includes(newRole)) {
    return { user: null, error: { message: 'Invalid role' } };
  }

  const { data: user, error } = await client
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)
    .single();

  if (error) {
    return { user: null, error };
  }

  // Update auth metadata
  const { error: authError } = await client.auth.admin.updateUserById(
    userId,
    { user_metadata: { role: newRole } }
  );

  if (authError) {
    return { user: null, error: authError };
  }

  return { user, error: null };
}
