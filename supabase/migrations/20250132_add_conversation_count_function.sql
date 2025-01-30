-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.count_conversations_per_ticket();

-- Create function to count conversations per ticket
CREATE OR REPLACE FUNCTION public.count_conversations_per_ticket()
RETURNS TABLE (ticket_id uuid, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For admin/worker, return all conversation counts
  IF (SELECT auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'worker') THEN
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
