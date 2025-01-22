// @ts-nocheck
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import {
  signUpUser,
  signInUser,
  getUserProfile,
  listAllUsers,
  signOut
} from '../frontend/src/lib/auth';
import { mockSupabaseClient, resetMockSupabase } from './mocks/supabase';
import type { UserRole } from '../frontend/src/types';

// Regular client for tests
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client for cleanup
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

describe('Authentication Service', () => {
  beforeEach(() => {
    resetMockSupabase();
  });

  describe('Sign Up', () => {
    it('should allow new users to sign up with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'SecurePass123!';
      const role: UserRole = 'customer';

      const { user, error } = await signUpUser(email, password, role, mockSupabaseClient);

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.email).toBe(email);
      expect(user?.role).toBe(role);
    });

    it('should reject signup with invalid email', async () => {
      const { user, error } = await signUpUser(
        'invalid-email',
        'SecurePass123!',
        'customer',
        mockSupabaseClient
      );

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Invalid email format');
    });

    it('should reject signup with weak password', async () => {
      const { user, error } = await signUpUser(
        'test@example.com',
        'weak',
        'customer',
        mockSupabaseClient
      );

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Password does not meet security requirements');
    });

    it('should prevent duplicate email signups', async () => {
      const email = 'test@example.com';
      const password = 'SecurePass123!';
      const role: UserRole = 'customer';

      // First signup should succeed
      const first = await signUpUser(email, password, role, mockSupabaseClient);
      expect(first.error).toBeNull();
      expect(first.user).toBeTruthy();

      // Second signup should fail
      const second = await signUpUser(email, password, role, mockSupabaseClient);
      expect(second.user).toBeNull();
      expect(second.error).toBeTruthy();
      expect(second.error?.message).toBe('User already exists');
    });
  });

  describe('Sign In', () => {
    const email = 'test@example.com';
    const password = 'SecurePass123!';
    const role: UserRole = 'customer';

    beforeEach(async () => {
      await signUpUser(email, password, role, mockSupabaseClient);
    });

    it('should allow sign in with correct credentials', async () => {
      const { user, error } = await signInUser(email, password, mockSupabaseClient);

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.email).toBe(email);
    });

    it('should reject sign in with incorrect password', async () => {
      const { user, error } = await signInUser(email, 'wrongpassword', mockSupabaseClient);

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Invalid login credentials');
    });
  });

  describe('User Profile', () => {
    let userId: string;

    beforeEach(async () => {
      const { user } = await signUpUser(
        'test@example.com',
        'SecurePass123!',
        'customer',
        mockSupabaseClient
      );
      userId = user!.id;
    });

    it('should retrieve user profile with valid ID', async () => {
      const { user, error } = await getUserProfile(userId, mockSupabaseClient);

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.id).toBe(userId);
    });

    it('should return error for invalid user ID', async () => {
      const { user, error } = await getUserProfile('invalid-id', mockSupabaseClient);

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('User not found');
    });
  });

  describe('Access Control', () => {
    let customerId: string;
    let workerId: string;
    let adminId: string;

    beforeEach(async () => {
      // Create test users
      const { user: customer } = await signUpUser(
        'customer@example.com',
        'SecurePass123!',
        'customer',
        mockSupabaseClient
      );
      customerId = customer!.id;

      const { user: worker } = await signUpUser(
        'worker@example.com',
        'SecurePass123!',
        'worker',
        mockSupabaseClient
      );
      workerId = worker!.id;

      const { user: admin } = await signUpUser(
        'admin@example.com',
        'SecurePass123!',
        'admin',
        mockSupabaseClient
      );
      adminId = admin!.id;
    });

    it('should restrict customer access to other profiles', async () => {
      await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);

      const { user, error } = await getUserProfile(workerId, mockSupabaseClient);
      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Unauthorized');
    });

    it('should allow workers to view customer profiles', async () => {
      await signInUser('worker@example.com', 'SecurePass123!', mockSupabaseClient);

      const { user, error } = await getUserProfile(customerId, mockSupabaseClient);
      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.id).toBe(customerId);
    });

    it('should allow admins full access', async () => {
      await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

      const { users, error } = await listAllUsers(mockSupabaseClient);
      expect(error).toBeNull();
      expect(users).toBeTruthy();
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe('Sign Out', () => {
    it('should successfully sign out user', async () => {
      await signUpUser('test@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
      await signInUser('test@example.com', 'SecurePass123!', mockSupabaseClient);

      const { error } = await signOut(mockSupabaseClient);
      expect(error).toBeNull();

      // Verify session is cleared
      const { data: { session } } = await mockSupabaseClient.auth.getSession();
      expect(session).toBeNull();
    });
  });
});
