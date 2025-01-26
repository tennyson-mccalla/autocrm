-- Create function to count conversations per ticket
CREATE OR REPLACE FUNCTION count_conversations_per_ticket()
RETURNS TABLE (ticket_id uuid, count bigint)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.ticket_id, COUNT(*)::bigint
  FROM conversations c
  GROUP BY c.ticket_id;
END;
$$ LANGUAGE plpgsql;
