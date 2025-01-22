-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    ));

-- Tickets policies
CREATE POLICY "Customers can view their own tickets"
    ON tickets FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Customers can create tickets"
    ON tickets FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Agents can view all tickets"
    ON tickets FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('agent', 'admin')
    ));

CREATE POLICY "Agents can update assigned tickets"
    ON tickets FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('agent', 'admin')
        AND (tickets.assigned_to = auth.uid() OR users.role = 'admin')
    ));

-- Conversations policies
CREATE POLICY "Users can view conversations on their tickets"
    ON conversations FOR SELECT
    USING (
        auth.uid() IN (
            SELECT created_by FROM tickets WHERE tickets.id = conversations.ticket_id
            UNION
            SELECT assigned_to FROM tickets WHERE tickets.id = conversations.ticket_id
        )
        OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('agent', 'admin')
        )
    );

CREATE POLICY "Users can add conversations to their tickets"
    ON conversations FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT created_by FROM tickets WHERE tickets.id = conversations.ticket_id
            UNION
            SELECT assigned_to FROM tickets WHERE tickets.id = conversations.ticket_id
        )
        OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('agent', 'admin')
        )
    );

-- Internal notes policy
CREATE POLICY "Only agents and admins can view internal notes"
    ON conversations FOR SELECT
    USING (
        (NOT internal_note)
        OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('agent', 'admin')
        )
    );

-- More policies to follow...
