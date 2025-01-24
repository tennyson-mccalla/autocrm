import { createTicket } from '@/lib/tickets'
import type { TicketPriority, TicketStatus } from '@/lib/tickets'
import { createMockSupabaseClient } from '../mocks/supabase'
import { createClient } from '@/lib/supabase'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn()
}))

describe('Ticket Creation API', () => {
  const mockUsers = {
    customer: {
      id: 'customer-id',
      role: 'customer',
      email: 'customer@example.com'
    },
    worker: {
      id: 'worker-id',
      role: 'worker',
      email: 'worker@example.com'
    },
    admin: {
      id: 'admin-id',
      role: 'admin',
      email: 'admin@example.com'
    }
  }

  const validTicketData = {
    title: 'Test Ticket',
    description: 'Test Description',
    priority: 'medium' as TicketPriority
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authorization', () => {
    it('allows customers to create tickets for themselves', async () => {
      const mockClient = createMockSupabaseClient()
      // @ts-ignore
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUsers.customer, user_metadata: { role: 'customer' } } },
        error: null
      })
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const result = await createTicket(validTicketData)

      expect(result.error).toBeNull()
      expect(mockClient.from).toHaveBeenCalledWith('tickets')
    })

    it('allows workers to create tickets on behalf of customers', async () => {
      const mockClient = createMockSupabaseClient()
      // @ts-ignore
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUsers.worker, user_metadata: { role: 'worker' } } },
        error: null
      })
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const result = await createTicket({
        ...validTicketData,
        created_by: mockUsers.customer.id
      })

      expect(result.error).toBeNull()
      expect(mockClient.from).toHaveBeenCalledWith('tickets')
    })

    it('allows admins to create tickets with custom fields', async () => {
      const mockClient = createMockSupabaseClient()
      // @ts-ignore
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUsers.admin, user_metadata: { role: 'admin' } } },
        error: null
      })
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const result = await createTicket({
        ...validTicketData,
        created_by: mockUsers.customer.id,
        status: 'in_progress' as TicketStatus,
        assigned_to: mockUsers.worker.id
      })

      expect(result.error).toBeNull()
      expect(mockClient.from).toHaveBeenCalledWith('tickets')
    })
  })

  describe('Validation', () => {
    it('prevents customers from creating tickets for other users', async () => {
      const mockClient = createMockSupabaseClient()
      // @ts-ignore
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUsers.customer, user_metadata: { role: 'customer' } } },
        error: null
      })
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const result = await createTicket({
        ...validTicketData,
        created_by: mockUsers.admin.id
      })

      expect(result.error).toEqual(expect.objectContaining({
        message: expect.stringMatching(/unauthorized/i)
      }))
    })

    it('prevents setting invalid status values', async () => {
      const mockClient = createMockSupabaseClient()
      // @ts-ignore
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUsers.admin, user_metadata: { role: 'admin' } } },
        error: null
      })
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const result = await createTicket({
        ...validTicketData,
        // @ts-expect-error - Testing invalid status
        status: 'invalid_status'
      })

      expect(result.error).toEqual(expect.objectContaining({
        message: expect.stringMatching(/invalid status/i)
      }))
    })

    it('prevents setting invalid priority values', async () => {
      const mockClient = createMockSupabaseClient()
      // @ts-ignore
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUsers.admin, user_metadata: { role: 'admin' } } },
        error: null
      })
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const result = await createTicket({
        ...validTicketData,
        // @ts-expect-error - Testing invalid priority
        priority: 'invalid_priority'
      })

      expect(result.error).toEqual(expect.objectContaining({
        message: expect.stringMatching(/invalid priority/i)
      }))
    })
  })
})
