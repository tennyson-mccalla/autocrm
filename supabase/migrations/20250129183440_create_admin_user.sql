-- Create admin user in auth.users if it doesn't exist
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@test.com';

  -- If admin user doesn't exist, create it
  IF admin_id IS NULL THEN
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
      'admin@test.com',
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO admin_id;
  END IF;

  -- Create admin user in public.users if it doesn't exist
  INSERT INTO public.users (id, email, role)
  VALUES (admin_id, 'admin@test.com', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;
