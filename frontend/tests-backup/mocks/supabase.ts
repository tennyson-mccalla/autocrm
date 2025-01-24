import { jest } from '@jest/globals';
import { SupabaseClient, User } from '@supabase/supabase-js';

const mockData = {
  users: new Map<string, User>(),
  tickets: []
};

const createMockQueryBuilder = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockImplementation((data) => {
    const result = Array.isArray(data) ? data : [data];
    return {
      data: result,
      error: null,
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnValue({ data: result[0], error: null })
    };
  }),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockImplementation((start, end) => ({
    data: [],
    error: null,
    count: 0
  })),
  single: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  execute: jest.fn().mockImplementation(() => ({
    data: [],
    error: null
  }))
});

const mockAuthMethods = {
  getSession: jest.fn().mockResolvedValue({
    data: {
      session: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: { role: 'customer' }
        },
        access_token: 'test-token',
        refresh_token: 'test-refresh-token'
      }
    },
    error: null
  }),
  getUser: jest.fn().mockResolvedValue({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { role: 'customer' }
      }
    },
    error: null
  }),
  signUp: jest.fn().mockImplementation(({ email, password, options }) => {
    const user = {
      id: 'test-user-id',
      email,
      user_metadata: { role: options?.data?.role || 'customer' }
    };
    mockData.users.set(user.id, user as User);
    return Promise.resolve({
      data: { user, session: null },
      error: null
    });
  }),
  signInWithPassword: jest.fn().mockImplementation(({ email }) => {
    const user = {
      id: 'test-user-id',
      email,
      user_metadata: { role: 'customer' }
    };
    return Promise.resolve({
      data: {
        user,
        session: {
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          user
        }
      },
      error: null
    });
  }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: jest.fn().mockImplementation((callback) => {
    callback('SIGNED_IN', {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { role: 'customer' }
      }
    });
    return { data: { subscription: { unsubscribe: jest.fn() } }, error: null };
  })
};

import { SupabaseClient } from '@supabase/supabase-js';

export const createMockSupabaseClient = () => {
  const mockClient = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: { role: 'customer' }
            }
          }
        },
        error: null
      }),
      signUp: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { role: 'customer' }
          }
        },
        error: null
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { role: 'customer' }
          },
          session: {
            access_token: 'test-token'
          }
        },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockImplementation((callback) => {
        callback('SIGNED_IN', {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { role: 'customer' }
          }
        });
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      })
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => ({
        data: {
          id: 1,
          title: 'Test Ticket',
          description: 'Test Description',
          status: 'open',
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'test-user-id'
        },
        error: null
      }))
    })
  };

  return mockClient as unknown as SupabaseClient;
};

export const resetMockStore = () => {
  mockData.users.clear();
  mockData.tickets = [];
  Object.values(mockAuthMethods).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};

// Reset all mocks between tests
beforeEach(() => {
  resetMockStore();
});
