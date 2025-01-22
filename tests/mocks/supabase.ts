// @ts-nocheck
let users = [];
let tickets = [];
let currentSession = null;

class PostgrestFilterBuilder {
  constructor(data = [], table = 'users') {
    this.data = data;
    this.table = table;
    this.filters = {};
    this.updateData = null;
    this.orderField = null;
    this.orderDirection = null;
  }

  eq(field, value) {
    this.filters[field] = value;
    return this;
  }

  order(field, { ascending = true } = {}) {
    this.orderField = field;
    this.orderDirection = ascending;
    return this;
  }

  select(columns = '*') {
    if (!currentSession?.user && this.table !== 'auth') {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    let filtered = this.data.filter(item => {
      return Object.entries(this.filters).every(([field, value]) => item[field] === value);
    });

    if (this.orderField) {
      filtered.sort((a, b) => {
        const aVal = a[this.orderField];
        const bVal = b[this.orderField];
        return this.orderDirection ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return {
      data: filtered,
      error: null,
      single: () => {
        const item = filtered[0];
        if (!item) {
          return { data: null, error: { message: 'Record not found' } };
        }
        const { password, ...safeItem } = item;
        return { data: safeItem, error: null };
      },
      then: () => Promise.resolve({ data: filtered, error: null })
    };
  }

  update(data) {
    this.updateData = data;
    return {
      eq: (field, value) => {
        this.filters[field] = value;
        return {
          select: () => {
            if (!currentSession?.user) {
              return { data: null, error: { message: 'Not authenticated' } };
            }

            const filtered = this.data.filter(item => {
              return Object.entries(this.filters).every(([field, value]) => item[field] === value);
            });

            if (filtered.length === 0) {
              return { data: null, error: { message: 'Record not found' } };
            }

            const item = filtered[0];
            const isAdmin = currentSession.user.user_metadata?.role === 'admin';
            const isSelfUpdate = item.id === currentSession.user.id;

            if (!isAdmin && !isSelfUpdate) {
              return { data: null, error: { message: 'Unauthorized' } };
            }

            Object.assign(item, { ...this.updateData, updated_at: new Date().toISOString() });
            return {
              data: item,
              error: null,
              single: () => ({ data: item, error: null })
            };
          }
        };
      }
    };
  }

  insert(data) {
    const id = `${this.table}-${Date.now()}`;
    const record = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.table === 'users') {
      users.push(record);
    } else if (this.table === 'tickets') {
      tickets.push(record);
    }

    return {
      select: () => ({
        single: () => ({ data: record, error: null })
      })
    };
  }
}

const mockSupabaseClient = {
  auth: {
    signUp: jest.fn().mockImplementation(({ email, password, options }) => {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return { data: null, error: { message: 'User already exists' } };
      }

      const id = `user-${Date.now()}`;
      const user = {
        id,
        email,
        password,
        role: options?.data?.role || 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      users.push(user);
      currentSession = {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { role: user.role }
        }
      };

      const { password: _, ...safeUser } = user;
      return { data: { user: safeUser }, error: null };
    }),

    signInWithPassword: jest.fn().mockImplementation(({ email, password }) => {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        return { data: null, error: { message: 'Invalid login credentials' } };
      }

      currentSession = {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { role: user.role }
        }
      };

      const { password: _, ...safeUser } = user;
      return { data: { user: safeUser }, error: null };
    }),

    signOut: jest.fn().mockImplementation(() => {
      currentSession = null;
      return { error: null };
    }),

    getSession: jest.fn().mockImplementation(() => {
      return { data: { session: currentSession }, error: null };
    })
  },

  from: jest.fn().mockImplementation((table) => {
    const data = table === 'users' ? users : tickets;
    return new PostgrestFilterBuilder(data, table);
  })
};

export const resetMockSupabase = () => {
  users = [];
  tickets = [];
  currentSession = null;
  jest.clearAllMocks();
};

export default mockSupabaseClient;
