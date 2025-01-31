import { supabase } from './supabase';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Development-only logging helper
const logAuthEvent = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'development') {
    if (error) {
      console.log(`🔴 Auth Event: ${message}`, error);
    } else {
      console.log(`🟢 Auth Event: ${message}`);
    }
  }
};

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
  logAuthEvent(`Attempting to create new user with email: ${email} and role: ${role}`);
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { role }
    }
  });

  if (error) {
    logAuthEvent(`Failed to create user with email: ${email}`, error);
    return { user: null, error };
  }

  logAuthEvent(`Successfully created user with email: ${email}`);
  return { user: data.user, error: null };
}

export async function signInUser(
  email: string,
  password: string,
  client: typeof supabase = createSupabaseClient()
) {
  logAuthEvent(`Attempting to sign in user with email: ${email}`);
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logAuthEvent(`Failed to sign in user with email: ${email}`, error);
    return { user: null, error };
  }

  // After successful sign in, check if user is admin and update metadata
  if (data.user) {
    const { data: isAdminData } = await client.rpc('is_admin', { user_id: data.user.id });
    if (isAdminData) {
      const { error: updateError } = await client.auth.updateUser({
        data: { role: 'admin' }
      });

      if (updateError) {
        logAuthEvent('Failed to update user role metadata', updateError);
      } else {
        logAuthEvent('Successfully updated user role metadata to admin');
        // Update the user object with the new metadata
        data.user.user_metadata = { ...data.user.user_metadata, role: 'admin' };
      }
    }
  }

  logAuthEvent(`Successfully signed in user with email: ${email}`);
  return { user: data.user, error: null };
}

export async function signOutUser(
  client: typeof supabase = createSupabaseClient()
) {
  logAuthEvent('Attempting to sign out user');
  const { error } = await client.auth.signOut();

  if (error) {
    logAuthEvent('Failed to sign out user', error);
  } else {
    logAuthEvent('Successfully signed out user');
  }

  return { error };
}

export async function getCurrentUser(
  client: typeof supabase = createSupabaseClient()
) {
  logAuthEvent('Checking current session');
  const { data: { session }, error } = await client.auth.getSession();

  if (error) {
    logAuthEvent('Failed to get current session', error);
    return { user: null, error };
  }

  if (!session) {
    logAuthEvent('No active session found');
    return { user: null, error: { message: 'No session found' } };
  }

  logAuthEvent(`Found active session for user: ${session.user.email}`);
  return { user: session.user, error: null };
}

export async function getUserProfile(
  userId: string,
  client: typeof supabase = createSupabaseClient()
) {
  if (!userId) {
    logAuthEvent('Profile lookup attempted without user ID');
    return { user: null, error: { message: 'User ID is required' } };
  }

  logAuthEvent(`Fetching profile for user ID: ${userId}`);
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError) {
    logAuthEvent('Session error while fetching profile', sessionError);
    return { user: null, error: sessionError };
  }

  if (!session) {
    logAuthEvent('Profile lookup attempted without active session');
    return { user: null, error: { message: 'Not authenticated' } };
  }

  const userRole = session.user.user_metadata.role;
  logAuthEvent(`Profile lookup by ${userRole} role`);

  const { data: user, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    logAuthEvent(`Failed to fetch profile for user ID: ${userId}`, error);
    return { user: null, error };
  }

  if (!user) {
    logAuthEvent(`No profile found for user ID: ${userId}`);
    return { user: null, error: { message: 'User not found' } };
  }

  if (userRole === 'customer' && user.id !== session.user.id) {
    logAuthEvent('Unauthorized profile access attempt');
    return { user: null, error: { message: 'Unauthorized' } };
  }

  logAuthEvent(`Successfully fetched profile for user ID: ${userId}`);
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
  logAuthEvent(`Attempting to update profile for user ID: ${userId}`);
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError) {
    logAuthEvent('Session error during profile update', sessionError);
    return { user: null, error: sessionError };
  }

  if (!session) {
    logAuthEvent('Profile update attempted without active session');
    return { user: null, error: { message: 'No session found' } };
  }

  const currentUser = session.user;
  const isAdmin = currentUser.user_metadata?.role === 'admin';
  const isOwnProfile = currentUser.id === userId;

  if (!isAdmin && !isOwnProfile) {
    logAuthEvent('Unauthorized profile update attempt');
    return { user: null, error: { message: 'Unauthorized' } };
  }

  if (updates.full_name && updates.full_name.length > 100) {
    logAuthEvent('Profile update failed: full name too long');
    return { user: null, error: { message: 'Full name is too long' } };
  }

  if (updates.metadata) {
    try {
      JSON.stringify(updates.metadata);
    } catch (err) {
      logAuthEvent('Profile update failed: invalid metadata format', err);
      return { user: null, error: { message: 'Invalid metadata format' } };
    }
  }

  const { data: user, error } = await client
    .from('users')
    .update(updates)
    .eq('id', userId)
    .single();

  if (error) {
    logAuthEvent(`Failed to update profile for user ID: ${userId}`, error);
    return { user: null, error };
  }

  logAuthEvent(`Successfully updated profile for user ID: ${userId}`);
  return { user, error: null };
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  client: typeof supabase = createSupabaseClient()
) {
  logAuthEvent(`Attempting to update role to ${newRole} for user ID: ${userId}`);
  const { data: { session }, error: sessionError } = await client.auth.getSession();

  if (sessionError) {
    logAuthEvent('Session error during role update', sessionError);
    return { user: null, error: sessionError };
  }

  if (!session) {
    logAuthEvent('Role update attempted without active session');
    return { user: null, error: { message: 'No session found' } };
  }

  if (session.user.user_metadata?.role !== 'admin') {
    logAuthEvent('Non-admin role update attempt');
    return { user: null, error: { message: 'Only admins can change user roles' } };
  }

  if (!['admin', 'worker', 'customer'].includes(newRole)) {
    logAuthEvent(`Invalid role update attempt: ${newRole}`);
    return { user: null, error: { message: 'Invalid role' } };
  }

  const { data: user, error } = await client
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)
    .single();

  if (error) {
    logAuthEvent(`Failed to update role in database for user ID: ${userId}`, error);
    return { user: null, error };
  }

  const { error: authError } = await client.auth.admin.updateUserById(
    userId,
    { user_metadata: { role: newRole } }
  );

  if (authError) {
    logAuthEvent(`Failed to update role in auth metadata for user ID: ${userId}`, authError);
    return { user: null, error: authError };
  }

  logAuthEvent(`Successfully updated role to ${newRole} for user ID: ${userId}`);
  return { user, error: null };
}
