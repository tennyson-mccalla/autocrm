-- Create some worker users
DO $$
DECLARE
  worker1_id uuid;
  worker2_id uuid;
  tech_support_id uuid;
  account_mgmt_id uuid;
  billing_support_id uuid;
  feature_requests_id uuid;
BEGIN
  -- Create or get worker 1
  SELECT id INTO worker1_id FROM auth.users WHERE email = 'worker1@test.com';
  IF worker1_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'worker1@test.com',
      crypt('password123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '', '', '', ''
    ) RETURNING id INTO worker1_id;
  END IF;

  -- Create or get worker 2
  SELECT id INTO worker2_id FROM auth.users WHERE email = 'worker2@test.com';
  IF worker2_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'worker2@test.com',
      crypt('password123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '', '', '', ''
    ) RETURNING id INTO worker2_id;
  END IF;

  -- Create worker users in public.users
  INSERT INTO public.users (id, email, role)
  VALUES
    (worker1_id, 'worker1@test.com', 'worker'),
    (worker2_id, 'worker2@test.com', 'worker')
  ON CONFLICT (id) DO UPDATE SET role = 'worker';

  -- Create queues if they don't exist
  INSERT INTO public.queues (name, description)
  VALUES
    ('Technical Support', 'Technical issues and bugs'),
    ('Account Management', 'Account-related issues and requests'),
    ('Billing Support', 'Payment and subscription issues'),
    ('Feature Requests', 'New feature suggestions and improvements')
  ON CONFLICT (name) DO NOTHING;

  -- Get queue IDs
  SELECT id INTO tech_support_id FROM public.queues WHERE name = 'Technical Support';
  SELECT id INTO account_mgmt_id FROM public.queues WHERE name = 'Account Management';
  SELECT id INTO billing_support_id FROM public.queues WHERE name = 'Billing Support';
  SELECT id INTO feature_requests_id FROM public.queues WHERE name = 'Feature Requests';

  -- Create some sample tickets if none exist
  IF NOT EXISTS (SELECT 1 FROM public.tickets LIMIT 1) THEN
    -- Create tickets
    WITH new_tickets AS (
      INSERT INTO public.tickets (title, description, status, priority, created_by, assigned_to)
      VALUES
        ('Server Down', 'Production server is not responding', 'open', 'high', worker1_id, worker1_id),
        ('Billing Issue', 'Unable to process payment', 'open', 'medium', worker2_id, worker2_id),
        ('Feature Request', 'Add dark mode support', 'open', 'low', worker2_id, worker2_id),
        ('Account Access', 'Reset password needed', 'open', 'medium', worker1_id, worker1_id)
      RETURNING id, title
    )
    -- Assign tickets to queues
    INSERT INTO public.queue_assignments (queue_id, ticket_id)
    SELECT
      CASE
        WHEN title LIKE '%Server%' THEN tech_support_id
        WHEN title LIKE '%Billing%' THEN billing_support_id
        WHEN title LIKE '%Feature%' THEN feature_requests_id
        ELSE account_mgmt_id
      END,
      id
    FROM new_tickets;

    -- Add conversations to tickets
    INSERT INTO public.conversations (ticket_id, message, user_id)
    SELECT
      t.id,
      'Initial investigation started. Will update soon.',
      t.assigned_to
    FROM public.tickets t;
  END IF;

END $$;
