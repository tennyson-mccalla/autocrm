import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './supabase';
import { validateEmail, validatePassword } from './validation';
import type { User, UserRole } from '../types';

function convertSupabaseUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    role: (supabaseUser.user_metadata?.role || 'customer') as UserRole,
    full_name: supabaseUser.user_metadata?.full_name,
    metadata: supabaseUser.user_metadata?.metadata,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at
  };
}

export async function signUpUser(
  email: string,
  password: string,
  role: UserRole,
  client: SupabaseClient = createClient()
): Promise<{ user: User | null; error: any }> {
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { user: null, error: { message: emailValidation.error } };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { user: null, error: { message: passwordValidation.error } };
  }

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

  return { user: data.user ? convertSupabaseUser(data.user) : null, error: null };
}

export async function signInUser(
  email: string,
  password: string,
  client: SupabaseClient = createClient()
): Promise<{ user: User | null; error: any }> {
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { user: null, error: { message: emailValidation.error } };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { user: null, error };
  }

  return { user: data.user ? convertSupabaseUser(data.user) : null, error: null };
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
): Promise<{ user: User | null; error: any }> {
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

  return { user: convertSupabaseUser(user), error: null };
}

export async function listAllUsers(
  client: SupabaseClient = createClient()
): Promise<{ users: User[] | null; error: any }> {
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

  return { users: users.map(convertSupabaseUser), error: null };
}

export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    metadata?: Record<string, any>;
  },
  client: SupabaseClient = createClient()
) {
  // Check authentication
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session) {
    return { user: null, error: sessionError || { message: 'Not authenticated' } };
  }

  // Only allow users to update their own profile unless they're an admin
  const userRole = session.user.user_metadata.role;
  if (userRole !== 'admin' && userId !== session.user.id) {
    return { user: null, error: { message: 'Unauthorized' } };
  }

  // Validate full_name if provided
  if (updates.full_name !== undefined && updates.full_name.length > 100) {
    return { user: null, error: { message: 'Full name is too long' } };
  }

  // Validate metadata if provided
  if (updates.metadata !== undefined) {
    try {
      JSON.stringify(updates.metadata);
    } catch (e) {
      return { user: null, error: { message: 'Invalid metadata format' } };
    }
  }

  // Add updated_at timestamp
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  const { data: user, error } = await client
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { user: null, error };
  }

  return { user, error: null };
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  client: SupabaseClient = createClient()
) {
  // Check authentication
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session) {
    return { user: null, error: sessionError || { message: 'Not authenticated' } };
  }

  // Only admins can change roles
  const userRole = session.user.user_metadata.role;
  if (userRole !== 'admin') {
    return { user: null, error: { message: 'Only admins can modify roles' } };
  }

  // Validate the new role
  const validRoles: UserRole[] = ['customer', 'worker', 'admin'];
  if (!validRoles.includes(newRole)) {
    return { user: null, error: { message: 'Invalid role' } };
  }

  // Get current user data to check if it exists
  const { data: currentUser, error: fetchError } = await client
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (fetchError || !currentUser) {
    return { user: null, error: fetchError || { message: 'User not found' } };
  }

  // Update both the users table and auth metadata
  const { data: user, error: updateError } = await client
    .from('users')
    .update({
      role: newRole,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) {
    return { user: null, error: updateError };
  }

  // Update auth metadata to keep it in sync
  const { error: metadataError } = await client.auth.admin.updateUserById(
    userId,
    { user_metadata: { role: newRole } }
  );

  if (metadataError) {
    // If metadata update fails, revert the role change
    await client
      .from('users')
      .update({
        role: currentUser.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return { user: null, error: metadataError };
  }

  return { user, error: null };
}
