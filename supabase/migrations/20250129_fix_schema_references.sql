-- Move tickets table to public schema if not already there
ALTER TABLE IF EXISTS tickets SET SCHEMA public;

-- Update foreign key references
ALTER TABLE IF EXISTS public.queue_assignments
  DROP CONSTRAINT IF EXISTS queue_assignments_ticket_id_fkey,
  ADD CONSTRAINT queue_assignments_ticket_id_fkey
    FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;
