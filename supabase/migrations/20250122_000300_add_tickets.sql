-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_id UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'))
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policies for tickets
CREATE POLICY "Customers can create tickets"
    ON tickets FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can view their own tickets"
    ON tickets FOR SELECT
    TO authenticated
    USING (
        auth.uid() = customer_id OR
        (SELECT role FROM users WHERE id = auth.uid()) IN ('worker', 'admin')
    );

CREATE POLICY "Workers and admins can update tickets"
    ON tickets FOR UPDATE
    TO authenticated
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('worker', 'admin')
    );
