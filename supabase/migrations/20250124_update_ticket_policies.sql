-- Add policy for workers to assign tickets to themselves
CREATE POLICY "Workers can assign tickets to themselves"
    ON tickets FOR UPDATE
    USING (check_user_role('worker'::user_role))
    WITH CHECK (
        check_user_role('worker'::user_role)
        AND (assigned_to = auth.uid() OR assigned_to IS NULL)
    );
