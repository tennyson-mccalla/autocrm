// @ts-nocheck
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import {
  signUpUser,
  signInUser,
  signOutUser as signOut,
  getCurrentUser
} from '../src/lib/auth';
import {
  createTicket,
  listTickets,
  updateTicketStatus,
  assignTicket
} from '../src/lib/tickets';
import { mockSupabaseClient, resetMockStore } from './mocks/supabase';
import type { UserRole } from '../src/types';

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

jest.mock('../src/lib/supabase', () => ({
  createClient: () => mockSupabaseClient
}));

describe('Authentication Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign Up', () => {
    it('should allow new users to sign up with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'ValidPass123!';
      const role = 'customer';

      const { user, error } = await signUpUser(email, password, role, mockSupabaseClient);

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.email).toBe(email);
      expect(user?.user_metadata?.role).toBe(role);
    });

    it('should reject signup with invalid email format', async () => {
      const email = 'invalid-email';
      const password = 'ValidPass123!';
      const role = 'customer';

      mockSupabaseClient.auth.signUp.mockImplementationOnce(() => Promise.resolve({
        data: { user: null },
        error: new Error('Invalid email format')
      }));

      const { user, error } = await signUpUser(email, password, role, mockSupabaseClient);

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Invalid email format');
    });

    it('should reject signup with empty email', async () => {
      const email = '';
      const password = 'ValidPass123!';
      const role = 'customer';

      mockSupabaseClient.auth.signUp.mockImplementationOnce(() => Promise.resolve({
        data: { user: null },
        error: new Error('Email is required')
      }));

      const { user, error } = await signUpUser(email, password, role, mockSupabaseClient);

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Email is required');
    });

    it('should reject signup with email starting with dot', async () => {
      const email = '.test@example.com';
      const password = 'ValidPass123!';
      const role = 'customer';

      mockSupabaseClient.auth.signUp.mockImplementationOnce(() => Promise.resolve({
        data: { user: null },
        error: new Error('Email cannot start or end with a dot')
      }));

      const { user, error } = await signUpUser(email, password, role, mockSupabaseClient);

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Email cannot start or end with a dot');
    });

    it('should reject signup with too long email', async () => {
      const email = 'a'.repeat(65) + '@example.com';
      const password = 'ValidPass123!';
      const role = 'customer';

      mockSupabaseClient.auth.signUp.mockImplementationOnce(() => Promise.resolve({
        data: { user: null },
        error: new Error('Local part of email is too long')
      }));

      const { user, error } = await signUpUser(email, password, role, mockSupabaseClient);

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Local part of email is too long');
    });

    it('should reject signup with weak password', async () => {
      const email = 'test@example.com';
      const password = 'weak';
      const role = 'customer';

      mockSupabaseClient.auth.signUp.mockImplementationOnce(() => Promise.resolve({
        data: { user: null },
        error: new Error('Password must be at least 8 characters long')
      }));

      const { user, error } = await signUpUser(email, password, role, mockSupabaseClient);

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Password must be at least 8 characters long');
    });

    it('should reject signup with password missing uppercase', async () => {
      const email = 'test@example.com';
      const password = 'nouppercasepass123!';
      const role = 'customer';

      mockSupabaseClient.auth.signUp.mockImplementationOnce(() => Promise.resolve({
        data: { user: null },
        error: new Error('Password must contain at least one uppercase letter')
      }));

      const { user, error } = await signUpUser(email, password, role, mockSupabaseClient);

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Password must contain at least one uppercase letter');
    });

    it('should prevent duplicate email signups', async () => {
      const email = 'test@example.com';
      const password = 'ValidPass123!';
      const role = 'customer';

      // First signup should succeed
      const first = await signUpUser(email, password, role, mockSupabaseClient);
      expect(first.error).toBeNull();
      expect(first.user).toBeTruthy();

      // Mock the duplicate signup error
      mockSupabaseClient.auth.signUp.mockImplementationOnce(() => Promise.resolve({
        data: { user: null },
        error: new Error('User already exists')
      }));

      // Second signup should fail
      const second = await signUpUser(email, password, role, mockSupabaseClient);
      expect(second.user).toBeNull();
      expect(second.error).toBeTruthy();
      expect(second.error?.message).toBe('User already exists');
    });
  });

  describe('Sign In', () => {
    it('should allow sign in with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'ValidPass123!';

      const { user, error } = await signInUser(email, password, mockSupabaseClient);

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.email).toBe(email);
    });

    it('should reject sign in with incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'WrongPass123!';

      mockSupabaseClient.auth.signInWithPassword.mockImplementationOnce(() => Promise.resolve({
        data: { user: null },
        error: new Error('Invalid login credentials')
      }));

      const { user, error } = await signInUser(email, password, mockSupabaseClient);

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
      const { user, error } = await getCurrentUser(userId, mockSupabaseClient);

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.id).toBe(userId);
    });

    it('should return error for invalid user ID', async () => {
      const { user, error } = await getCurrentUser('invalid-id', mockSupabaseClient);

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

      const { user, error } = await getCurrentUser(workerId, mockSupabaseClient);
      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Unauthorized');
    });

    it('should allow workers to view customer profiles', async () => {
      await signInUser('worker@example.com', 'SecurePass123!', mockSupabaseClient);

      const { user, error } = await getCurrentUser(customerId, mockSupabaseClient);
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
      expect(users.length).toBeGreaterThan(0);
    }, 60000);
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

  describe('Profile Updates', () => {
    let userId: string;
    const email = 'test@example.com';
    const password = 'SecurePass123!';
    const role: UserRole = 'customer';

    beforeEach(async () => {
      const { user } = await signUpUser(email, password, role, mockSupabaseClient);
      userId = user!.id;
      await signInUser(email, password, mockSupabaseClient);
    });

    it('should allow user to update their full name', async () => {
      const updates = { full_name: 'John Doe' };
      const { user, error } = await updateUserProfile(userId, updates, mockSupabaseClient);

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.full_name).toBe('John Doe');
      expect(user?.updated_at).toBeTruthy();
    });

    it('should allow user to update their metadata', async () => {
      const updates = { metadata: { company: 'TechCorp', department: 'IT' } };
      const { user, error } = await updateUserProfile(userId, updates, mockSupabaseClient);

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.metadata).toEqual(updates.metadata);
    });

    it('should reject full name that is too long', async () => {
      const longName = 'a'.repeat(101);
      const { user, error } = await updateUserProfile(userId, { full_name: longName }, mockSupabaseClient);

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Full name is too long');
    });

    it('should reject invalid metadata format', async () => {
      const circularRef: any = {};
      circularRef.self = circularRef;

      const { user, error } = await updateUserProfile(
        userId,
        { metadata: circularRef },
        mockSupabaseClient
      );

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Invalid metadata format');
    });

    it('should prevent users from updating other profiles', async () => {
      // Create another user
      const { user: otherUser } = await signUpUser(
        'other@example.com',
        'SecurePass123!',
        'customer',
        mockSupabaseClient
      );

      const { user, error } = await updateUserProfile(
        otherUser!.id,
        { full_name: 'Hacker' },
        mockSupabaseClient
      );

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Unauthorized');
    });

    it('should allow admin to update any profile', async () => {
      // Create and sign in as admin
      const { user: admin } = await signUpUser(
        'admin@example.com',
        'SecurePass123!',
        'admin',
        mockSupabaseClient
      );
      await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

      const updates = { full_name: 'Updated By Admin' };
      const { user, error } = await updateUserProfile(userId, updates, mockSupabaseClient);

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.full_name).toBe('Updated By Admin');
    });

    it('should update timestamp when profile is modified', async () => {
      const before = new Date('2025-01-01');
      const { user, error } = await updateUserProfile(
        userId,
        { full_name: 'New Name' },
        mockSupabaseClient
      );

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(new Date(user!.updated_at).getTime()).toBeGreaterThan(before.getTime());
    });
  });

  describe('Role Management', () => {
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

    it('should prevent non-admin from changing roles', async () => {
      // Sign in as customer
      await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);

      const { user, error } = await updateUserRole(
        customerId,
        'admin',
        mockSupabaseClient
      );

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Only admins can modify roles');
    });

    it('should prevent worker from changing roles', async () => {
      // Sign in as worker
      await signInUser('worker@example.com', 'SecurePass123!', mockSupabaseClient);

      const { user, error } = await updateUserRole(
        customerId,
        'worker',
        mockSupabaseClient
      );

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Only admins can modify roles');
    });

    it('should allow admin to promote customer to worker', async () => {
      // Sign in as admin
      await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

      const { user, error } = await updateUserRole(
        customerId,
        'worker',
        mockSupabaseClient
      );

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.role).toBe('worker');
    });

    it('should allow admin to demote worker to customer', async () => {
      // Sign in as admin
      await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

      const { user, error } = await updateUserRole(
        workerId,
        'customer',
        mockSupabaseClient
      );

      expect(error).toBeNull();
      expect(user).toBeTruthy();
      expect(user?.role).toBe('customer');
    });

    it('should reject invalid role values', async () => {
      // Sign in as admin
      await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

      const { user, error } = await updateUserRole(
        customerId,
        'invalid_role' as UserRole,
        mockSupabaseClient
      );

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Invalid role');
    });

    it('should reject role update for non-existent user', async () => {
      // Sign in as admin
      await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

      const { user, error } = await updateUserRole(
        'non-existent-id',
        'worker',
        mockSupabaseClient
      );

      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('User not found');
    });

    it('should update auth metadata when role is changed', async () => {
      // Sign in as admin
      await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

      // Update role
      await updateUserRole(customerId, 'worker', mockSupabaseClient);

      // Verify user metadata is updated
      const { data: { session } } = await mockSupabaseClient.auth.getSession();
      const { data: authUser } = await mockSupabaseClient.auth.getUser(customerId);

      expect(authUser?.user?.user_metadata?.role).toBe('worker');
    });
  });
});

describe('Edge Cases and Refinements', () => {
  let userId: string;

  beforeEach(async () => {
    const { user } = await signUpUser('test@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
    userId = user!.id;
    await signInUser('test@example.com', 'SecurePass123!', mockSupabaseClient);
  });

  it('should reject invalid email formats', async () => {
    const invalidEmails = [
      'notanemail',
      'missing@domain',
      '@nodomain.com',
      'spaces in@email.com',
      'unicode@🙂.com'
    ];

    for (const email of invalidEmails) {
      const { user, error } = await signUpUser(email, 'SecurePass123!', 'customer', mockSupabaseClient);
      expect(user).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toMatch(/invalid email/i);
    }
  });

  it('should prevent users from self-promoting their role', async () => {
    // Try to update own role to admin
    const { data: { session } } = await mockSupabaseClient.auth.getSession();
    const { error } = await mockSupabaseClient
      .from('users')
      .update({ role: 'admin' })
      .eq('id', session!.user.id);

    expect(error).toBeTruthy();
    expect(error?.message).toMatch(/permission denied|unauthorized/i);

    // Verify role hasn't changed
    const { user } = await getCurrentUser(userId, mockSupabaseClient);
    expect(user?.role).toBe('customer');
  });

  it('should handle metadata updates correctly', async () => {
    const metadata = {
      phone: '123-456-7890',
      preferences: { theme: 'dark', notifications: true }
    };

    const { user, error } = await updateUserProfile(
      userId,
      { metadata },
      mockSupabaseClient
    );

    expect(error).toBeNull();
    expect(user).toBeTruthy();
    expect(user?.metadata).toEqual(metadata);
  });

  it('should reject invalid metadata formats', async () => {
    const circularRef: any = {};
    circularRef.self = circularRef;

    const { user, error } = await updateUserProfile(
      userId,
      { metadata: circularRef },
      mockSupabaseClient
    );

    expect(user).toBeNull();
    expect(error).toBeTruthy();
    expect(error?.message).toBe('Invalid metadata format');
  });
});

describe('Integration with Tickets', () => {
  let customerId: string;
  let workerId: string;

  beforeEach(async () => {
    // Create and sign in as customer
    const { user: customer } = await signUpUser('customer@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
    customerId = customer!.id;
    await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);

    // Create worker
    const { user: worker } = await signUpUser('worker@example.com', 'SecurePass123!', 'worker', mockSupabaseClient);
    workerId = worker!.id;
  });

  it('should allow customer to create and view their ticket', async () => {
    // Create ticket as customer
    const { ticket, error: createError } = await createTicket(
      'Test Ticket',
      'Description',
      mockSupabaseClient
    );

    expect(createError).toBeNull();
    expect(ticket).toBeTruthy();
    expect(ticket?.customer_id).toBe(customerId);

    // Verify customer can view their ticket
    const { tickets, error: listError } = await listTickets(mockSupabaseClient);

    expect(listError).toBeNull();
    expect(tickets).toBeTruthy();
    expect(tickets?.length).toBe(1);
    expect(tickets?.[0].id).toBe(ticket?.id);
  });

  it('should allow worker to access assigned ticket', async () => {
    // Create ticket as customer
    const { ticket: newTicket } = await createTicket(
      'Test Ticket',
      'Description',
      mockSupabaseClient
    );

    // Sign in as admin to assign ticket
    await signUpUser('admin@example.com', 'SecurePass123!', 'admin', mockSupabaseClient);
    await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

    // Assign ticket to worker
    await assignTicket(newTicket!.id, workerId, mockSupabaseClient);

    // Sign in as worker
    await signInUser('worker@example.com', 'SecurePass123!', mockSupabaseClient);

    // Verify worker can access the ticket
    const { tickets, error } = await listTickets(mockSupabaseClient);

    expect(error).toBeNull();
    expect(tickets).toBeTruthy();
    expect(tickets?.some(t => t.id === newTicket!.id)).toBe(true);
  });

  it('should prevent customer from accessing other customers tickets', async () => {
    // Create ticket as first customer
    const { ticket: firstTicket } = await createTicket(
      'First Customer Ticket',
      'Description',
      mockSupabaseClient
    );

    // Create and sign in as second customer
    await signUpUser('customer2@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
    await signInUser('customer2@example.com', 'SecurePass123!', mockSupabaseClient);

    // Try to access first customer's ticket
    const { tickets, error } = await listTickets(mockSupabaseClient);

    expect(error).toBeNull();
    expect(tickets).toBeTruthy();
    expect(tickets?.some(t => t.id === firstTicket!.id)).toBe(false);
  });
});
