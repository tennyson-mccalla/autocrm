import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createTicket,
  listTickets,
  updateTicketStatus,
  assignTicket
} from '../frontend/src/lib/tickets';
import { signUpUser, signInUser } from '../frontend/src/lib/auth';
import { mockSupabaseClient, resetMockSupabase } from './mocks/supabase';

describe('Ticket Service', () => {
  beforeEach(() => {
    resetMockSupabase();
  });

  describe('Create Ticket', () => {
    it('should allow customers to create tickets', async () => {
      // Create and sign in as customer
      const { user } = await signUpUser('customer@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
      await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);

      const { ticket, error } = await createTicket(
        'Test Ticket',
        'This is a test ticket',
        mockSupabaseClient
      );

      expect(error).toBeNull();
      expect(ticket).toBeTruthy();
      expect(ticket?.title).toBe('Test Ticket');
      expect(ticket?.status).toBe('open');
      expect(ticket?.customer_id).toBe(user?.id);
    });

    it('should require authentication', async () => {
      const { ticket, error } = await createTicket(
        'Test Ticket',
        'This is a test ticket',
        mockSupabaseClient
      );

      expect(ticket).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Not authenticated');
    });
  });

  describe('List Tickets', () => {
    it('should allow workers to view all tickets', async () => {
      // Create customer and ticket
      const { user: customer } = await signUpUser('customer@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
      await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);
      await createTicket('Customer Ticket', 'Test ticket', mockSupabaseClient);

      // Sign in as worker
      await signUpUser('worker@example.com', 'SecurePass123!', 'worker', mockSupabaseClient);
      await signInUser('worker@example.com', 'SecurePass123!', mockSupabaseClient);

      const { tickets, error } = await listTickets(mockSupabaseClient);

      expect(error).toBeNull();
      expect(tickets).toBeTruthy();
      expect(Array.isArray(tickets)).toBe(true);
      expect(tickets?.length).toBe(1);
      expect(tickets?.[0].customer_id).toBe(customer?.id);
    });

    it('should allow customers to view their own tickets', async () => {
      // Create and sign in as customer
      const { user } = await signUpUser('customer@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
      await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);

      // Create a ticket
      await createTicket('My Ticket', 'Test ticket', mockSupabaseClient);

      const { tickets, error } = await listTickets(mockSupabaseClient);

      expect(error).toBeNull();
      expect(tickets).toBeTruthy();
      expect(Array.isArray(tickets)).toBe(true);
      expect(tickets?.length).toBe(1);
      expect(tickets?.[0].customer_id).toBe(user?.id);
    });
  });

  describe('Update Ticket', () => {
    it('should allow workers to update ticket status', async () => {
      // Create customer and ticket
      await signUpUser('customer@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
      await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);
      const { ticket: newTicket } = await createTicket('Test Ticket', 'Test description', mockSupabaseClient);

      // Sign in as worker
      await signUpUser('worker@example.com', 'SecurePass123!', 'worker', mockSupabaseClient);
      await signInUser('worker@example.com', 'SecurePass123!', mockSupabaseClient);

      const { ticket, error } = await updateTicketStatus(
        newTicket!.id,
        'in_progress',
        mockSupabaseClient
      );

      expect(error).toBeNull();
      expect(ticket).toBeTruthy();
      expect(ticket?.status).toBe('in_progress');
    });

    it('should prevent customers from updating tickets', async () => {
      // Create and sign in as customer
      await signUpUser('customer@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
      await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);

      // Create a ticket
      const { ticket: newTicket } = await createTicket('Test Ticket', 'Test description', mockSupabaseClient);

      const { ticket, error } = await updateTicketStatus(
        newTicket!.id,
        'resolved',
        mockSupabaseClient
      );

      expect(ticket).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Unauthorized');
    });
  });

  describe('Assign Ticket', () => {
    it('should allow assigning tickets to workers', async () => {
      // Create customer and ticket
      await signUpUser('customer@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
      await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);
      const { ticket: newTicket } = await createTicket('Test Ticket', 'Test description', mockSupabaseClient);

      // Create worker
      const { user: worker } = await signUpUser('worker@example.com', 'SecurePass123!', 'worker', mockSupabaseClient);

      // Sign in as admin
      await signUpUser('admin@example.com', 'SecurePass123!', 'admin', mockSupabaseClient);
      await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

      const { ticket, error } = await assignTicket(
        newTicket!.id,
        worker!.id,
        mockSupabaseClient
      );

      expect(error).toBeNull();
      expect(ticket).toBeTruthy();
      expect(ticket?.assigned_to).toBe(worker!.id);
      expect(ticket?.status).toBe('in_progress');
    });

    it('should prevent assigning tickets to non-workers', async () => {
      // Create customer and ticket
      const { user: customer } = await signUpUser('customer@example.com', 'SecurePass123!', 'customer', mockSupabaseClient);
      await signInUser('customer@example.com', 'SecurePass123!', mockSupabaseClient);
      const { ticket: newTicket } = await createTicket('Test Ticket', 'Test description', mockSupabaseClient);

      // Sign in as admin
      await signUpUser('admin@example.com', 'SecurePass123!', 'admin', mockSupabaseClient);
      await signInUser('admin@example.com', 'SecurePass123!', mockSupabaseClient);

      const { ticket, error } = await assignTicket(
        newTicket!.id,
        customer!.id,
        mockSupabaseClient
      );

      expect(ticket).toBeNull();
      expect(error).toBeTruthy();
      expect(error?.message).toBe('Invalid worker assignment');
    });
  });
});
