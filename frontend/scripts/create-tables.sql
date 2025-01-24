-- Create profiles table
-- create table if not exists public.profiles (
--   id uuid references auth.users on delete cascade primary key,
--   email text unique not null,
--   role text not null check (role in ('admin', 'worker', 'customer')),
--   created_at timestamptz default now(),
--   updated_at timestamptz default now()
-- );

-- Create tickets table
create table if not exists public.tickets (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')),
  status text check (status in ('new', 'open', 'in_progress', 'resolved', 'closed')),
  created_by uuid references public.users(id),
  assigned_to uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create queues table
create table if not exists public.queues (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create queue assignments table
create table if not exists public.queue_assignments (
  id uuid default uuid_generate_v4() primary key,
  queue_id uuid references public.queues(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete cascade,
  assigned_at timestamptz default now(),
  assigned_by uuid references public.users(id),
  unique(queue_id, ticket_id)
);

-- Enable RLS
alter table public.tickets enable row level security;
alter table public.queues enable row level security;
alter table public.queue_assignments enable row level security;

-- Create policies
create policy "Tickets are viewable by everyone"
  on tickets for select
  using (true);

create policy "Authenticated users can create tickets"
  on tickets for insert
  with check (auth.role() = 'authenticated');

create policy "Workers and admins can update tickets"
  on tickets for update
  using (
    exists (
      select 1 from users
      where id = auth.uid()
      and role in ('worker', 'admin')
    )
  );

create policy "Queues are viewable by everyone"
  on queues for select
  using (true);

create policy "Admins can manage queues"
  on queues for all
  using (
    exists (
      select 1 from users
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Queue assignments are viewable by everyone"
  on queue_assignments for select
  using (true);

create policy "Workers and admins can manage queue assignments"
  on queue_assignments for all
  using (
    exists (
      select 1 from users
      where id = auth.uid()
      and role in ('worker', 'admin')
    )
  );
