import { SupabaseClient } from '@supabase/supabase-js';

interface MockUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface MockTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  customer_id: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface MockSession {
  user: {
    id: string;
    email: string;
    user_metadata: {
      role: string;
    };
  };
}

const mockUsers = new Map<string, MockUser>();
const mockTickets = new Map<string, MockTicket>();
let currentSession: MockSession | null = null;

export function resetMockSupabase() {
  mockUsers.clear();
  mockTickets.clear();
  currentSession = null;
}

export const mockSupabaseClient = {
  auth: {
    signUp: async ({ email, options }: { email: string; options?: any }) => {
      const id = Math.random().toString(36).substring(7);
      const user = {
        id,
        email,
        role: options?.data?.role || 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockUsers.set(id, user);
      currentSession = {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { role: user.role }
        }
      };
      return { data: { user, session: currentSession }, error: null };
    },

    signInWithPassword: async ({ email }: any) => {
      const user = Array.from(mockUsers.values()).find(u => u.email === email);
      if (user) {
        currentSession = {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { role: user.role }
          }
        };
        return { data: { session: currentSession }, error: null };
      }
      return { data: null, error: { message: 'Invalid credentials' } };
    },

    signOut: async () => {
      currentSession = null;
      return { error: null };
    },

    getSession: async () => {
      return { data: { session: currentSession }, error: null };
    },

    setSession: async (session: MockSession) => {
      currentSession = session;
      return { data: { session }, error: null };
    }
  },

  from: (table: string) => {
    const handlers = {
      users: {
        select: () => ({
          eq: (field: string, value: any) => ({
            single: async () => {
              const user = Array.from(mockUsers.values()).find(u => (u as any)[field] === value);
              return { data: { role: user?.role }, error: null };
            }
          })
        })
      },
      tickets: {
        select: () => {
          const query = {
            eq: (field: string, value: any) => {
              query.filter = (t: MockTicket) => (t as any)[field] === value;
              return query;
            },
            single: async () => {
              const tickets = Array.from(mockTickets.values());
              const ticket = query.filter ? tickets.find(query.filter) : tickets[0];
              return { data: ticket || null, error: null };
            },
            filter: null as ((t: MockTicket) => boolean) | null,
            then: async () => {
              let tickets = Array.from(mockTickets.values());
              if (query.filter) {
                tickets = tickets.filter(query.filter);
              }
              if (currentSession?.user.user_metadata.role === 'customer') {
                tickets = tickets.filter(t => t.customer_id === currentSession?.user.id);
              }
              return { data: tickets, error: null };
            }
          };
          return query;
        },
        insert: (data: any) => ({
          select: () => ({
            single: async () => {
              const id = Math.random().toString(36).substring(7);
              const ticket = {
                id,
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              mockTickets.set(id, ticket);
              return { data: ticket, error: null };
            }
          })
        }),
        update: (data: any) => ({
          eq: (field: string, value: any) => ({
            select: () => ({
              single: async () => {
                const ticket = Array.from(mockTickets.values()).find(t => (t as any)[field] === value);
                if (ticket) {
                  const updatedTicket = { ...ticket, ...data };
                  mockTickets.set(ticket.id, updatedTicket);
                  return { data: updatedTicket, error: null };
                }
                return { data: null, error: { message: 'Ticket not found' } };
              }
            })
          })
        })
      }
    };

    return handlers[table as keyof typeof handlers];
  }
} as unknown as SupabaseClient;
