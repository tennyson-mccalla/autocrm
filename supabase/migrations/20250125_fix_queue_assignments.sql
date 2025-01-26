-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.queue_assignments;
DROP TABLE IF EXISTS public.queues;

-- Create queues table
CREATE TABLE public.queues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create queue_assignments table
CREATE TABLE public.queue_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_id uuid REFERENCES public.queues(id) ON DELETE CASCADE NOT NULL,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  assigned_by uuid REFERENCES auth.users(id) NOT NULL,
  UNIQUE(queue_id, ticket_id)
);

-- Enable RLS
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for queues
CREATE POLICY "Queues are viewable by workers and admins"
  ON public.queues FOR SELECT
  USING (check_user_role('worker'::user_role) OR check_user_role('admin'::user_role));

CREATE POLICY "Queues are manageable by admins"
  ON public.queues FOR ALL
  USING (check_user_role('admin'::user_role));

-- Create policies for queue assignments
CREATE POLICY "Queue assignments are viewable by workers and admins"
  ON public.queue_assignments FOR SELECT
  USING (check_user_role('worker'::user_role) OR check_user_role('admin'::user_role));

CREATE POLICY "Queue assignments are manageable by admins"
  ON public.queue_assignments FOR ALL
  USING (check_user_role('admin'::user_role));

CREATE POLICY "Workers can assign tickets to queues"
  ON public.queue_assignments FOR INSERT
  WITH CHECK (check_user_role('worker'::user_role));

-- Create function to assign ticket to queue
CREATE OR REPLACE FUNCTION public.assign_ticket_to_queue(
  _ticket_id uuid,
  _queue_id uuid
) RETURNS public.queue_assignments
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_assignment public.queue_assignments;
BEGIN
  INSERT INTO public.queue_assignments (queue_id, ticket_id, assigned_by)
  VALUES (_queue_id, _ticket_id, auth.uid())
  RETURNING * INTO v_assignment;

  RETURN v_assignment;
END;
$$;
