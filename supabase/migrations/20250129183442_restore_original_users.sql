-- Restore original users
DO $$
DECLARE
  user_id uuid;
  user_email text;
  admin_id uuid;
  worker1_id uuid;
  worker2_id uuid;
BEGIN
  -- Create admin user if not exists
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@test.com';
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@test.com',
      crypt('password123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '', '', '', ''
    ) RETURNING id INTO admin_id;

    INSERT INTO public.users (id, email, role)
    VALUES (admin_id, 'admin@test.com', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  ELSE
    UPDATE public.users SET role = 'admin' WHERE id = admin_id;
  END IF;

  -- Create worker1 if not exists
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

    INSERT INTO public.users (id, email, role)
    VALUES (worker1_id, 'worker1@test.com', 'worker')
    ON CONFLICT (id) DO UPDATE SET role = 'worker';
  END IF;

  -- Create worker2 if not exists
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

    INSERT INTO public.users (id, email, role)
    VALUES (worker2_id, 'worker2@test.com', 'worker')
    ON CONFLICT (id) DO UPDATE SET role = 'worker';
  END IF;

  -- Create original customer users
  FOR user_email IN
    SELECT unnest(ARRAY[
      'emma@techcorp.com',
      'olivia@agency.com',
      'michael@startup.io',
      'customer1@test.com',
      'james@enterprise.net',
      'test@example.com',
      'customer3@test.com',
      'sarah@company.com',
      'admin_test@example.com',
      'sophia@solutions.com',
      'test2@example.com',
      'customer2@test.com',
      'william@consulting.org',
      'customer4@test.com',
      'customer5@test.com',
      'customer6@test.com',
      'customer7@test.com',
      'customer8@test.com',
      'customer9@test.com',
      'customer10@test.com'
    ])
  LOOP
    -- Check if user exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
      -- Create auth user
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        user_email,
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
      ) RETURNING id INTO user_id;

      -- Create public user
      INSERT INTO public.users (id, email, role)
      VALUES (user_id, user_email, 'customer')
      ON CONFLICT (id) DO UPDATE SET role = 'customer';
    END IF;
  END LOOP;
END $$;
