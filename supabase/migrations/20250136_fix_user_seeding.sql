-- Create a function to create auth users
create or replace function create_auth_user(
  _email text,
  _password text,
  _role text,
  _full_name text
) returns uuid as $$
declare
  v_user_id uuid;
begin
  -- Create the auth user
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    _email,
    crypt(_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object(
      'role', _role,
      'full_name', _full_name,
      'email_verified', true
    ),
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    null,
    null,
    null
  )
  returning id into v_user_id;

  return v_user_id;
end;
$$ language plpgsql security definer;

-- Create a function to seed initial users
create or replace function seed_initial_users() returns void as $$
declare
  v_admin_id uuid;
  v_alice_id uuid;
  v_bob_id uuid;
  v_charlie_id uuid;
  v_diana_id uuid;
begin
  -- Create admin user
  v_admin_id := create_auth_user('admin@test.com', 'password123', 'admin', 'Admin User');

  -- Create worker users
  v_alice_id := create_auth_user('alice@test.com', 'password123', 'worker', 'Alice Worker');
  v_bob_id := create_auth_user('bob@test.com', 'password123', 'worker', 'Bob Worker');

  -- Create customer users
  v_charlie_id := create_auth_user('charlie@test.com', 'password123', 'customer', 'Charlie Customer');
  v_diana_id := create_auth_user('diana@test.com', 'password123', 'customer', 'Diana Customer');

  -- Update the IDs in public.users to match auth.users
  update public.users set id = v_admin_id where email = 'admin@test.com';
  update public.users set id = v_alice_id where email = 'alice@test.com';
  update public.users set id = v_bob_id where email = 'bob@test.com';
  update public.users set id = v_charlie_id where email = 'charlie@test.com';
  update public.users set id = v_diana_id where email = 'diana@test.com';
end;
$$ language plpgsql security definer;
