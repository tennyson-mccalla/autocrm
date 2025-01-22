import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './supabase';
import { User } from '../types';

export async function signUpUser(
  email: string,
  password: string,
  role: string,
  client: SupabaseClient = createClient()
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
  client: SupabaseClient = createClient()
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
  client: SupabaseClient = createClient()
) {
  const { error } = await client.auth.signOut();
  return { error };
}

export async function getCurrentUser(
  client: SupabaseClient = createClient()
) {
  const { data: { session }, error } = await client.auth.getSession();
  if (error || !session) {
    return { user: null, error: error || { message: 'No session found' } };
  }

  return { user: session.user, error: null };
}

export async function getUserProfile(
  userId: string,
  client: SupabaseClient = createClient()
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
  client: SupabaseClient = createClient()
) {
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session) {
    return { users: null, error: sessionError || { message: 'Not authenticated' } };
  }

  const userRole = session.user.user_metadata.role;

  if (userRole !== 'admin') {
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
