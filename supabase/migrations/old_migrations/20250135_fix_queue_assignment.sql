-- Update the function to handle existing assignments
create or replace function public.assign_ticket_to_queue(
  _ticket_id uuid,
  _queue_id uuid
) returns public.queue_assignments
language plpgsql security definer
as $$
declare
  v_user_id uuid;
  v_assignment public.queue_assignments;
begin
  -- Get the user ID from auth.users and find matching public.users record
  select id into v_user_id
  from public.users
  where id = auth.uid();

  if v_user_id is null then
    raise exception 'User not found';
  end if;

  -- Try to update existing assignment first
  update public.queue_assignments
  set assigned_by = v_user_id,
      assigned_at = timezone('utc'::text, now())
  where queue_id = _queue_id and ticket_id = _ticket_id
  returning * into v_assignment;

  -- If no existing assignment was found, create a new one
  if v_assignment is null then
    insert into public.queue_assignments (queue_id, ticket_id, assigned_by)
    values (_queue_id, _ticket_id, v_user_id)
    returning * into v_assignment;
  end if;

  return v_assignment;
end;
$$;

-- Add policy for deleting queue assignments
create policy "Queue assignments are deletable by authenticated users"
  on public.queue_assignments for delete
  to authenticated
  using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'worker')
  );
