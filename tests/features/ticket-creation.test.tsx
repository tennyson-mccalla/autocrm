import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createClient } from '@supabase/supabase-js'
import { NewTicketForm } from '@/components/tickets/NewTicketForm'
import { AuthContext } from '@/contexts/AuthContext'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn()
}))

describe('Ticket Creation', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'customer',
    full_name: 'Test User'
  }

  const mockAuthContext = {
    user: mockUser,
    loading: false,
    error: null
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  it('renders the ticket creation form for authenticated users', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NewTicketForm />
      </AuthContext.Provider>
    )

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument()
  })

  it('requires authentication to view the form', () => {
    render(
      <AuthContext.Provider value={{ ...mockAuthContext, user: null }}>
        <NewTicketForm />
      </AuthContext.Provider>
    )

    expect(screen.getByText(/please sign in/i)).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('validates required fields before submission', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NewTicketForm />
      </AuthContext.Provider>
    )

    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }))

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    })
  })

  it('successfully creates a ticket with valid data', async () => {
    const mockCreateTicket = jest.fn().mockResolvedValue({
      data: { id: 'new-ticket-id' },
      error: null
    })

    ;(createClient as jest.Mock).mockImplementation(() => ({
      from: () => ({
        insert: mockCreateTicket
      })
    }))

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NewTicketForm />
      </AuthContext.Provider>
    )

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Ticket' }
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'This is a test ticket' }
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }))

    await waitFor(() => {
      expect(mockCreateTicket).toHaveBeenCalledWith([{
        title: 'Test Ticket',
        description: 'This is a test ticket',
        created_by: mockUser.id,
        status: 'open',
        priority: 'medium'
      }])
    })
  })

  it('handles API errors gracefully', async () => {
    const mockError = { message: 'Something went wrong' }
    const mockCreateTicket = jest.fn().mockResolvedValue({
      data: null,
      error: mockError
    })

    ;(createClient as jest.Mock).mockImplementation(() => ({
      from: () => ({
        insert: mockCreateTicket
      })
    }))

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NewTicketForm />
      </AuthContext.Provider>
    )

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Ticket' }
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'This is a test ticket' }
    })
    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }))

    await waitFor(() => {
      expect(screen.getByText(mockError.message)).toBeInTheDocument()
    })
  })
})
