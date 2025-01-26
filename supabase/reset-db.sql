BEGIN;

-- Clean up all data
TRUNCATE public.conversations CASCADE;
TRUNCATE public.queue_assignments CASCADE;
TRUNCATE public.ticket_assignments CASCADE;
TRUNCATE public.tickets CASCADE;
TRUNCATE public.users CASCADE;
TRUNCATE public.queues CASCADE;

-- Clean up auth users (this will cascade to public.users)
DELETE FROM auth.users WHERE id != '00000000-0000-0000-0000-000000000000';

COMMIT;
