-- Drop existing policies
DO $$
BEGIN
    -- Drop users policies
    DROP POLICY IF EXISTS "Users can read own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    DROP POLICY IF EXISTS "Workers can read all customer profiles" ON users;
    DROP POLICY IF EXISTS "Admins have full access to all profiles" ON users;
    DROP POLICY IF EXISTS "Users can update own non-role fields" ON users;

    -- Drop tickets policies
    DROP POLICY IF EXISTS "Customers can read/write own tickets" ON tickets;
    DROP POLICY IF EXISTS "Workers can read all tickets" ON tickets;
    DROP POLICY IF EXISTS "Admins have full access to tickets" ON tickets;
    DROP POLICY IF EXISTS "Workers can update assigned tickets" ON tickets;
    DROP POLICY IF EXISTS "Workers can assign tickets to themselves" ON tickets;

    -- Drop conversations policies
    DROP POLICY IF EXISTS "Customers can access conversations on own tickets" ON conversations;
    DROP POLICY IF EXISTS "Workers can read all conversations" ON conversations;
    DROP POLICY IF EXISTS "Workers can write conversations" ON conversations;
    DROP POLICY IF EXISTS "Workers can update own conversations" ON conversations;
END $$;

-- Create role check function
CREATE OR REPLACE FUNCTION check_user_role(required_role user_role)
RETURNS boolean AS $$
BEGIN
    RETURN (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = required_role::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Workers can read all customer profiles"
    ON users FOR SELECT
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'worker'
        AND role = 'customer'
    );

CREATE POLICY "Admins have full access to all profiles"
    ON users FOR ALL
    USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Users can update own non-role fields"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Tickets table policies
CREATE POLICY "Customers can read/write own tickets"
    ON tickets FOR ALL
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'customer'
        AND created_by = auth.uid()
    );

CREATE POLICY "Workers can read all tickets"
    ON tickets FOR SELECT
    USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'worker');

CREATE POLICY "Admins have full access to tickets"
    ON tickets FOR ALL
    USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Workers can update assigned tickets"
    ON tickets FOR UPDATE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'worker'
        AND assigned_to = auth.uid()
    );

-- Add policy for workers to assign tickets to themselves
CREATE POLICY "Workers can assign tickets to themselves"
    ON tickets FOR UPDATE
    USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'worker')
    WITH CHECK (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'worker'
        AND (assigned_to = auth.uid() OR assigned_to IS NULL)
    );

-- Conversations table policies
CREATE POLICY "Customers can access conversations on own tickets"
    ON conversations FOR ALL
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'customer'
        AND EXISTS (
            SELECT 1 FROM tickets t
            WHERE t.id = conversations.ticket_id
            AND t.created_by = auth.uid()
            AND NOT conversations.internal_note
        )
    );

CREATE POLICY "Workers can read all conversations"
    ON conversations FOR SELECT
    USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('worker', 'admin'));

CREATE POLICY "Workers can write conversations"
    ON conversations FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('worker', 'admin'));

CREATE POLICY "Workers can update own conversations"
    ON conversations FOR UPDATE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('worker', 'admin')
        AND user_id = auth.uid()
    );

-- More policies to follow...
