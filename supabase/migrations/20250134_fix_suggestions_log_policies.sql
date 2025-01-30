-- Fix RLS policies for suggestions_log table
DROP POLICY IF EXISTS "Allow authenticated users to insert logs" ON public.suggestions_log;
DROP POLICY IF EXISTS "Users can view their own logs" ON public.suggestions_log;
DROP POLICY IF EXISTS "Workers and admins can view all logs" ON public.suggestions_log;

-- Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated users to insert logs" ON public.suggestions_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to view their own logs
CREATE POLICY "Users can view their own logs" ON public.suggestions_log
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

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
