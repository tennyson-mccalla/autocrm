-- Create a secure schema for admin-related tables
CREATE SCHEMA IF NOT EXISTS admin;

-- Create admin_users table in the admin schema
CREATE TABLE IF NOT EXISTS admin.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant usage on admin schema to authenticated users
GRANT USAGE ON SCHEMA admin TO authenticated;

-- Grant select on admin.users to authenticated users
GRANT SELECT ON admin.users TO authenticated;

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin.users
    WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Add any user with role='admin' in public.users to admin.users
INSERT INTO admin.users (id)
SELECT u.id
FROM public.users u
WHERE u.role = 'admin'
ON CONFLICT (id) DO NOTHING;
