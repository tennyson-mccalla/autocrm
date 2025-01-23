import { jest } from '@jest/globals'

// @ts-nocheck
class QueryBuilder {
  private filters: Record<string, any> = {}
  private orderByField?: string
  private orderDirection?: 'asc' | 'desc'
  private data: any[]
  private error: any = null

  constructor(initialData: any[] = [], error: any = null) {
    this.data = [...initialData]
    this.error = error
  }

  eq(field: string, value: any) {
    this.filters[field] = value
    return this
  }

  order(field: string, { ascending = true } = {}) {
    this.orderByField = field
    this.orderDirection = ascending ? 'asc' : 'desc'
    return this
  }

  select(_columns = '*') {
    const builder = {
      order: (field: string, options: any) => {
        this.orderByField = field
        this.orderDirection = options?.ascending ? 'asc' : 'desc'
        return builder
      },
      eq: (field: string, value: any) => {
        this.filters[field] = value
        return builder
      },
      then: (callback: any) => {
        if (this.error) {
          return callback({ data: null, error: this.error })
        }

        const filtered = this.data.filter(item => {
          return Object.entries(this.filters).every(([field, value]) => item[field] === value)
        })

        if (this.orderByField) {
          filtered.sort((a, b) => {
            const aVal = a[this.orderByField!]
            const bVal = b[this.orderByField!]
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
            return this.orderDirection === 'asc' ? comparison : -comparison
          })
        }

        return callback({ data: filtered, error: null })
      }
    }

    return builder
  }

  single() {
    return this.select().then(({ data, error }) => ({
      data: data?.[0] || null,
      error
    }))
  }

  insert(records: any[]) {
    const inserted = records.map(record => ({
      id: `test-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record
    }))
    this.data.push(...inserted)
    return {
      select: () => ({
        single: () => Promise.resolve({ data: inserted[0], error: null })
      })
    }
  }
}

export const createMockSupabaseClient = (initialData = { users: [], tickets: [] }, error = null, user = null) => {
  const mockSession = {
    user,
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token'
  }

  return {
    auth: {
      getSession: jest.fn().mockImplementation(() =>
        Promise.resolve({ data: { session: mockSession }, error: null })
      ),
      getUser: jest.fn().mockImplementation(() =>
        Promise.resolve({ data: { user: mockSession.user }, error: null })
      ),
      signOut: jest.fn().mockImplementation(() => {
        mockSession.user = null
        return Promise.resolve({ error: null })
      })
    },
    // @ts-ignore - Jest mock typing issue
    from: jest.fn().mockImplementation((table) => {
      // @ts-ignore - Index access typing issue
      return new QueryBuilder(initialData[table], error)
    })
  }
}

export const resetMockData = () => {
  // Reset any stored data here if needed
}

export default createMockSupabaseClient
