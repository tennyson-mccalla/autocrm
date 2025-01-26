BEGIN;

-- Clean up existing data
TRUNCATE public.conversations CASCADE;
TRUNCATE public.queue_assignments CASCADE;
TRUNCATE public.ticket_assignments CASCADE;
TRUNCATE public.tickets CASCADE;
TRUNCATE public.users CASCADE;
TRUNCATE public.queues CASCADE;

-- Insert test users first
INSERT INTO users (id, email, role, full_name) VALUES
  ('8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'alice@test.com', 'worker', 'Alice Worker'),
  ('b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723', 'bob@test.com', 'worker', 'Bob Worker'),
  ('e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12', 'charlie@test.com', 'customer', 'Charlie Customer'),
  ('f7d8e9a2-6b5c-4f3d-8e9f-1a2b3c4d5e6f', 'diana@test.com', 'customer', 'Diana Customer'),
  ('a9b8c7d6-e5f4-4a3b-8c9d-1a2b3c4d5e6f', 'admin@test.com', 'admin', 'Admin User');

-- Insert test tickets
INSERT INTO tickets (id, title, description, status, priority, created_by, assigned_to) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f',
   'Unable to access account',
   'Getting 403 error when trying to log in',
   'new',
   'high',
   'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12',
   '8f9c55da-5c13-4f28-9e4e-74a8c1834875'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a',
   'Billing inquiry',
   'Question about last month''s invoice',
   'in_progress',
   'medium',
   'f7d8e9a2-6b5c-4f3d-8e9f-1a2b3c4d5e6f',
   'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a',
   'Feature request: Dark mode',
   'Would like dark mode option in dashboard',
   'resolved',
   'low',
   'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12',
   '8f9c55da-5c13-4f28-9e4e-74a8c1834875');

-- Insert test conversations
INSERT INTO conversations (id, ticket_id, user_id, message, internal_note) VALUES
  (uuid_generate_v4(), 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12', 'I cannot log in to my account', FALSE),
  (uuid_generate_v4(), 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', '8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'Looking into this now', FALSE),
  (uuid_generate_v4(), 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', '8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'User account locked - too many attempts', TRUE),
  (uuid_generate_v4(), 'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'f7d8e9a2-6b5c-4f3d-8e9f-1a2b3c4d5e6f', 'Need clarification on invoice', FALSE),
  (uuid_generate_v4(), 'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723', 'Which line item specifically?', FALSE),
  (uuid_generate_v4(), 'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723', 'Checking with billing department', TRUE),
  (uuid_generate_v4(), 'c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a', 'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12', 'Dark mode would be great for night work', FALSE),
  (uuid_generate_v4(), 'c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a', '8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'Feature request logged with development team', FALSE),
  (uuid_generate_v4(), 'c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a', '8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'Scheduled for next sprint', TRUE);

-- Insert test queues
INSERT INTO queues (id, name, description) VALUES
  ('d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', 'General Support', 'General customer support inquiries'),
  ('e2f3a4b5-c6d7-8e9f-0a1b-2c3d4e5f6a7b', 'Technical Issues', 'Technical problems and bugs'),
  ('f3a4b5c6-d7e8-9f0a-1b2c-3d4e5f6a7b8c', 'Billing Support', 'Billing and payment related issues');

-- Insert test queue assignments
INSERT INTO queue_assignments (id, queue_id, ticket_id, assigned_by, assigned_at) VALUES
  (uuid_generate_v4(), 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', '8f9c55da-5c13-4f28-9e4e-74a8c1834875', timezone('utc'::text, now())),
  (uuid_generate_v4(), 'e2f3a4b5-c6d7-8e9f-0a1b-2c3d4e5f6a7b', 'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723', timezone('utc'::text, now()));

COMMIT;
