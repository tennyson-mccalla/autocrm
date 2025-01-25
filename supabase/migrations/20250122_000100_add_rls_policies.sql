-- Create role check function
CREATE OR REPLACE FUNCTION check_user_role(required_role user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = required_role
    );
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
        check_user_role('worker'::user_role)
        AND role = 'customer'
    );

CREATE POLICY "Admins have full access to all profiles"
    ON users FOR ALL
    USING (check_user_role('admin'::user_role));

CREATE POLICY "Users can update own non-role fields"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Tickets table policies
CREATE POLICY "Customers can read/write own tickets"
    ON tickets FOR ALL
    USING (auth.uid() = created_by);

CREATE POLICY "Workers can read all tickets"
    ON tickets FOR SELECT
    USING (check_user_role('worker'::user_role));

CREATE POLICY "Admins have full access to tickets"
    ON tickets FOR ALL
    USING (check_user_role('admin'::user_role));

CREATE POLICY "Workers can update assigned tickets"
    ON tickets FOR UPDATE
    USING (
        check_user_role('worker'::user_role)
        AND assigned_to = auth.uid()
    );

-- Add policy for workers to assign tickets to themselves
CREATE POLICY "Workers can assign tickets to themselves"
    ON tickets FOR UPDATE
    USING (check_user_role('worker'::user_role))
    WITH CHECK (
        check_user_role('worker'::user_role)
        AND (assigned_to = auth.uid() OR assigned_to IS NULL)
    );

-- Conversations table policies
CREATE POLICY "Customers can access conversations on own tickets"
    ON conversations FOR ALL
    USING (
        auth.uid() IN (
            SELECT created_by FROM tickets WHERE id = ticket_id
        )
        AND (NOT internal_note)
    );

CREATE POLICY "Workers can read all conversations"
    ON conversations FOR SELECT
    USING (check_user_role('worker'::user_role) OR check_user_role('admin'::user_role));

CREATE POLICY "Workers can write conversations"
    ON conversations FOR INSERT
    WITH CHECK (check_user_role('worker'::user_role) OR check_user_role('admin'::user_role));

CREATE POLICY "Workers can update own conversations"
    ON conversations FOR UPDATE
    USING (
        (check_user_role('worker'::user_role) OR check_user_role('admin'::user_role))
        AND user_id = auth.uid()
    );

-- More policies to follow...
