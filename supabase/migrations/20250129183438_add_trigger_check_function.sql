-- Function to check if a trigger exists
CREATE OR REPLACE FUNCTION public.check_trigger_exists(trigger_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = trigger_name
    );
END;
$$;
