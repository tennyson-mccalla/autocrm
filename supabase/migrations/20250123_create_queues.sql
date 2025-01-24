-- Create queues table
create table if not exists public.queues (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create queue_assignments table
create table if not exists public.queue_assignments (
  id uuid default gen_random_uuid() primary key,
  queue_id uuid references public.queues(id) on delete cascade not null,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  assigned_by uuid references auth.users(id) not null,
  unique(queue_id, ticket_id)
);

-- Enable RLS
alter table public.queues enable row level security;
alter table public.queue_assignments enable row level security;

-- Drop existing policies if they exist
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'queues'
    and policyname = 'Queues are viewable by authenticated users'
  ) then
    drop policy "Queues are viewable by authenticated users" on public.queues;
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'queues'
    and policyname = 'Queues are insertable by authenticated users'
  ) then
    drop policy "Queues are insertable by authenticated users" on public.queues;
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'queue_assignments'
    and policyname = 'Queue assignments are viewable by authenticated users'
  ) then
    drop policy "Queue assignments are viewable by authenticated users" on public.queue_assignments;
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'queue_assignments'
    and policyname = 'Queue assignments are insertable by authenticated users'
  ) then
    drop policy "Queue assignments are insertable by authenticated users" on public.queue_assignments;
  end if;
end$$;

-- Create policies
create policy "Queues are viewable by authenticated users"
  on public.queues for select
  to authenticated
  using (true);

create policy "Queues are insertable by authenticated users"
  on public.queues for insert
  to authenticated
  with check (true);

create policy "Queue assignments are viewable by authenticated users"
  on public.queue_assignments for select
  to authenticated
  using (true);

create policy "Queue assignments are insertable by authenticated users"
  on public.queue_assignments for insert
  to authenticated
  with check (true);

-- Create or replace function
create or replace function public.assign_ticket_to_queue(
  _ticket_id uuid,
  _queue_id uuid
) returns public.queue_assignments
language plpgsql security definer
as $$
declare
  v_assignment public.queue_assignments;
begin
  insert into public.queue_assignments (queue_id, ticket_id, assigned_by)
  values (_queue_id, _ticket_id, auth.uid())
  returning * into v_assignment;

  return v_assignment;
end;
$$;
