// @ts-nocheck
import { render, screen, waitFor } from '@testing-library/react'
import { TicketList } from '@/components/tickets/TicketList'
import { createMockSupabaseClient } from '../mocks/supabase'
import { createClient } from '@/lib/supabase'
import type { Ticket } from '@/lib/tickets'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn()
}))

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}))

describe('Ticket Listing', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'customer',
    full_name: 'Test User',
    user_metadata: { role: 'customer' }
  }

  const mockTickets: Ticket[] = [
    {
      id: 'ticket-1',
      title: 'First Ticket',
      description: 'Test description 1',
      status: 'open',
      priority: 'high',
      created_by: mockUser.id,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'ticket-2',
      title: 'Second Ticket',
      description: 'Test description 2',
      status: 'in_progress',
      priority: 'medium',
      created_by: mockUser.id,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }
  ]

  const mockAuthContext = {
    user: mockUser,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    const { useAuth } = require('@/contexts/AuthContext')
    useAuth.mockReturnValue(mockAuthContext)
  })

  it('shows loading state initially', () => {
    const mockClient = createMockSupabaseClient({}, null, mockUser)
    // Never resolve to show loading state
    mockClient.from().select = () => new Promise(() => {})
    ;(createClient as jest.Mock).mockReturnValue(mockClient)

    render(<TicketList />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays user tickets when data is loaded', async () => {
    const mockClient = createMockSupabaseClient({ tickets: mockTickets }, null, mockUser)
    ;(createClient as jest.Mock).mockReturnValue(mockClient)

    render(<TicketList />)

    await waitFor(() => {
      expect(screen.getByText('First Ticket')).toBeInTheDocument()
      expect(screen.getByText('Second Ticket')).toBeInTheDocument()
    })

    // Verify ticket details are displayed
    expect(screen.getByText(/high priority/i)).toBeInTheDocument()
    expect(screen.getByText(/medium priority/i)).toBeInTheDocument()
    expect(screen.getByText('open')).toBeInTheDocument()
    expect(screen.getByText('in_progress')).toBeInTheDocument()
  })

  it('shows empty state when user has no tickets', async () => {
    const mockClient = createMockSupabaseClient({}, null, mockUser)
    ;(createClient as jest.Mock).mockReturnValue(mockClient)

    render(<TicketList />)

    await waitFor(() => {
      expect(screen.getByText(/no tickets found/i)).toBeInTheDocument()
    })
  })

  it('shows error message when loading fails', async () => {
    const mockClient = createMockSupabaseClient(
      { tickets: [] },
      { message: 'Failed to load tickets' },
      mockUser
    )
    ;(createClient as jest.Mock).mockReturnValue(mockClient)

    render(<TicketList />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load tickets/i)).toBeInTheDocument()
    })
  })

  it('requires authentication to view tickets', () => {
    const { useAuth } = require('@/contexts/AuthContext')
    useAuth.mockReturnValue({ ...mockAuthContext, user: null })

    render(<TicketList />)

    expect(screen.getByText(/please sign in/i)).toBeInTheDocument()
  })

  describe('Role-based listing', () => {
    const workerUser = {
      ...mockUser,
      id: 'worker-id',
      role: 'worker',
      user_metadata: { role: 'worker' }
    }

    const customerTickets = mockTickets
    const otherCustomerTickets: Ticket[] = [
      {
        id: 'ticket-3',
        title: 'Other Customer Ticket',
        description: 'From another customer',
        status: 'open',
        priority: 'low',
        created_by: 'other-customer-id',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      }
    ]

    it('shows only user tickets for customers', async () => {
      const mockClient = createMockSupabaseClient(
        { tickets: [...customerTickets, ...otherCustomerTickets] },
        null,
        mockUser
      )
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      render(<TicketList />)

      await waitFor(() => {
        expect(screen.getByText('First Ticket')).toBeInTheDocument()
        expect(screen.getByText('Second Ticket')).toBeInTheDocument()
        expect(screen.queryByText('Other Customer Ticket')).not.toBeInTheDocument()
      })
    })

    it('shows all tickets for workers', async () => {
      const mockClient = createMockSupabaseClient(
        { tickets: [...customerTickets, ...otherCustomerTickets] },
        null,
        workerUser
      )
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const { useAuth } = require('@/contexts/AuthContext')
      useAuth.mockReturnValue({ ...mockAuthContext, user: workerUser })

      render(<TicketList />)

      await waitFor(() => {
        expect(screen.getByText('First Ticket')).toBeInTheDocument()
        expect(screen.getByText('Second Ticket')).toBeInTheDocument()
        expect(screen.getByText('Other Customer Ticket')).toBeInTheDocument()
      })
    })
  })
})
