-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.count_conversations_per_ticket();

-- Create the new function
CREATE OR REPLACE FUNCTION public.count_conversations_per_ticket()
RETURNS TABLE (ticket_id uuid, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the user's role from the users table
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();

  -- For admin/worker, return all conversation counts
  IF user_role IN ('admin', 'worker') THEN
    RETURN QUERY
    SELECT c.ticket_id, COUNT(*)::bigint
    FROM conversations c
    GROUP BY c.ticket_id;
  ELSE
    -- For customers, only return counts for their own tickets
    RETURN QUERY
    SELECT c.ticket_id, COUNT(*)::bigint
    FROM conversations c
    JOIN tickets t ON t.id = c.ticket_id
    WHERE t.created_by = auth.uid()
    GROUP BY c.ticket_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.count_conversations_per_ticket() TO authenticated;
