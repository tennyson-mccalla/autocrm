-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_assignments ENABLE ROW LEVEL SECURITY;

-- Grant service role full access to all tables
GRANT ALL ON public.users TO authenticated, service_role;
GRANT ALL ON public.tickets TO authenticated, service_role;
GRANT ALL ON public.conversations TO authenticated, service_role;
GRANT ALL ON public.queues TO authenticated, service_role;
GRANT ALL ON public.queue_assignments TO authenticated, service_role;

-- Grant service role access to sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Add policies for service role
CREATE POLICY "Service role full access on users"
    ON public.users
    AS PERMISSIVE
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on tickets"
    ON public.tickets
    AS PERMISSIVE
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on conversations"
    ON public.conversations
    AS PERMISSIVE
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on queues"
    ON public.queues
    AS PERMISSIVE
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on queue_assignments"
    ON public.queue_assignments
    AS PERMISSIVE
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;
