-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Events table
create table if not exists public.events (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  date text not null,
  start_time text,
  end_time text,
  all_day boolean default false,
  color text default 'violet',
  category text,
  recurrence text default 'none',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.events enable row level security;

-- RLS Policies: users can only access their own events
create policy "Users can view own events"
  on public.events for select
  using (auth.uid() = user_id);

create policy "Users can insert own events"
  on public.events for insert
  with check (auth.uid() = user_id);

create policy "Users can update own events"
  on public.events for update
  using (auth.uid() = user_id);

create policy "Users can delete own events"
  on public.events for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_date_idx on public.events(date);
