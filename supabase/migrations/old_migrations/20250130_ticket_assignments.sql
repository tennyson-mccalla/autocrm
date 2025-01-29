-- Create ticket assignments table
create table if not exists public.ticket_assignments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  assigned_to uuid references public.users(id) on delete cascade not null,
  assigned_by uuid references public.users(id) not null,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(ticket_id, assigned_to)
);

-- Enable RLS
alter table public.ticket_assignments enable row level security;

-- Policies for ticket assignments
create policy "Ticket assignments are viewable by authenticated users"
  on public.ticket_assignments for select
  to authenticated
  using (true);

create policy "Admins can assign tickets"
  on public.ticket_assignments for insert
  to authenticated
  with check (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "Workers can assign tickets to themselves"
  on public.ticket_assignments for insert
  to authenticated
  with check (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'worker'
    )
    and assigned_to = auth.uid()
  );

-- Function to assign ticket
create or replace function public.assign_ticket(
  _ticket_id uuid,
  _assigned_to uuid
) returns public.ticket_assignments
language plpgsql security definer
as $$
declare
  v_assignment public.ticket_assignments;
begin
  insert into public.ticket_assignments (ticket_id, assigned_to, assigned_by)
  values (_ticket_id, _assigned_to, auth.uid())
  returning * into v_assignment;

  return v_assignment;
end;
$$;
