-- Create suggestions log table
CREATE TABLE public.suggestions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    original_suggestion TEXT NOT NULL,
    final_message TEXT,
    was_modified BOOLEAN NOT NULL,
    was_used BOOLEAN NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for ticket lookups
CREATE INDEX idx_suggestions_log_ticket ON public.suggestions_log(ticket_id);

-- Add RLS policies
ALTER TABLE public.suggestions_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated users to insert logs" ON public.suggestions_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to view their own logs
CREATE POLICY "Users can view their own logs" ON public.suggestions_log
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow workers and admins to view all logs
CREATE POLICY "Workers and admins can view all logs" ON public.suggestions_log
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND (users.role = 'worker' OR users.role = 'admin')
        )
    );
