-- Remove duplicate policy
DROP POLICY IF EXISTS "Workers and admins can create logs" ON public.suggestions_log;
