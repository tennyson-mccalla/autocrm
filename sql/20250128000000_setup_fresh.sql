-- Create test users with proper defaults
INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    raw_user_meta_data,
    raw_app_meta_data,
    aud,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    reauthentication_token,
    phone_change_token,
    is_sso_user,
    is_anonymous
) VALUES
-- Admin user
(
    'admin@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
    now(),
    'authenticated',
    '{"role": "admin", "full_name": "Admin User"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    false,
    false
),
-- Worker users
(
    'worker@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
    now(),
    'authenticated',
    '{"role": "worker", "full_name": "Test Worker"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    false,
    false
),
(
    'worker2@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
    now(),
    'authenticated',
    '{"role": "worker", "full_name": "Second Worker"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    false,
    false
),
-- Customer users
(
    'customer@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
    now(),
    'authenticated',
    '{"role": "customer", "full_name": "Test Customer"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    false,
    false
),
(
    'customer2@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
    now(),
    'authenticated',
    '{"role": "customer", "full_name": "Second Customer"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    false,
    false
);
