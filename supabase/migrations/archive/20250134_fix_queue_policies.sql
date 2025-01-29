-- Drop existing policies
drop policy if exists "Queues are viewable by authenticated users" on public.queues;
drop policy if exists "Queues are insertable by authenticated users" on public.queues;

-- Create updated policies that correctly check user_metadata
create policy "Queues are viewable by authenticated users"
  on public.queues for select
  to authenticated
  using (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'worker')
  );

create policy "Queues are insertable by authenticated users"
  on public.queues for insert
  to authenticated
  with check (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'worker')
  );
