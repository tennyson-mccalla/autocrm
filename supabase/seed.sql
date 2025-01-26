BEGIN;

-- Only insert test users if they don't exist
INSERT INTO public.users (id, email, role, full_name)
SELECT
  '8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'alice@test.com', 'worker'::user_role, 'Alice Worker'
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'alice@test.com'
);

INSERT INTO public.users (id, email, role, full_name)
SELECT
  'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723', 'bob@test.com', 'worker'::user_role, 'Bob Worker'
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'bob@test.com'
);

INSERT INTO public.users (id, email, role, full_name)
SELECT
  'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12', 'charlie@test.com', 'customer'::user_role, 'Charlie Customer'
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'charlie@test.com'
);

INSERT INTO public.users (id, email, role, full_name)
SELECT
  'f7d8e9a2-6b5c-4f3d-8e9f-1a2b3c4d5e6f', 'diana@test.com', 'customer'::user_role, 'Diana Customer'
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'diana@test.com'
);

INSERT INTO public.users (id, email, role, full_name)
SELECT
  'a9b8c7d6-e5f4-4a3b-8c9d-1a2b3c4d5e6f', 'admin@test.com', 'admin'::user_role, 'Admin User'
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'admin@test.com'
);

-- Only insert test tickets if they don't exist
INSERT INTO tickets (id, title, description, status, priority, created_by, assigned_to)
SELECT
  'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f',
  'Unable to access account',
  'Getting 403 error when trying to log in',
  'new',
  'high',
  'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12',
  '8f9c55da-5c13-4f28-9e4e-74a8c1834875'
WHERE NOT EXISTS (
  SELECT 1 FROM tickets WHERE id = 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f'
);

INSERT INTO tickets (id, title, description, status, priority, created_by, assigned_to)
SELECT
  'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a',
  'Billing inquiry',
  'Question about last month''s invoice',
  'in_progress',
  'medium',
  'f7d8e9a2-6b5c-4f3d-8e9f-1a2b3c4d5e6f',
  'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723'
WHERE NOT EXISTS (
  SELECT 1 FROM tickets WHERE id = 'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a'
);

INSERT INTO tickets (id, title, description, status, priority, created_by, assigned_to)
SELECT
  'c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a',
  'Feature request: Dark mode',
  'Would like dark mode option in dashboard',
  'resolved',
  'low',
  'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12',
  '8f9c55da-5c13-4f28-9e4e-74a8c1834875'
WHERE NOT EXISTS (
  SELECT 1 FROM tickets WHERE id = 'c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a'
);

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

-- Only insert test queues if they don't exist
INSERT INTO queues (id, name, description)
SELECT
  'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a',
  'General Support',
  'General customer support inquiries'
WHERE NOT EXISTS (
  SELECT 1 FROM queues WHERE name = 'General Support'
);

INSERT INTO queues (id, name, description)
SELECT
  'e2f3a4b5-c6d7-8e9f-0a1b-2c3d4e5f6a7b',
  'Technical Issues',
  'Technical problems and bugs'
WHERE NOT EXISTS (
  SELECT 1 FROM queues WHERE name = 'Technical Issues'
);

INSERT INTO queues (id, name, description)
SELECT
  'f3a4b5c6-d7e8-9f0a-1b2c-3d4e5f6a7b8c',
  'Billing Support',
  'Billing and payment related issues'
WHERE NOT EXISTS (
  SELECT 1 FROM queues WHERE name = 'Billing Support'
);

-- Only insert test queue assignments if they don't exist
INSERT INTO queue_assignments (id, queue_id, ticket_id, assigned_by, assigned_at)
SELECT
  uuid_generate_v4(),
  'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a',
  'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f',
  '8f9c55da-5c13-4f28-9e4e-74a8c1834875',
  timezone('utc'::text, now())
WHERE NOT EXISTS (
  SELECT 1 FROM queue_assignments
  WHERE queue_id = 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a'
  AND ticket_id = 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f'
);

INSERT INTO queue_assignments (id, queue_id, ticket_id, assigned_by, assigned_at)
SELECT
  uuid_generate_v4(),
  'e2f3a4b5-c6d7-8e9f-0a1b-2c3d4e5f6a7b',
  'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a',
  'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723',
  timezone('utc'::text, now())
WHERE NOT EXISTS (
  SELECT 1 FROM queue_assignments
  WHERE queue_id = 'e2f3a4b5-c6d7-8e9f-0a1b-2c3d4e5f6a7b'
  AND ticket_id = 'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a'
);

COMMIT;
