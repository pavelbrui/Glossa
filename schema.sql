-- Users table
create table public.users (
  id uuid references auth.users on delete cascade,
  email text unique,
  church_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_admin boolean default false,
  primary key (id)
);

-- Enable RLS
alter table public.users enable row level security;

-- Services table
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date text not null,
  time text not null,
  is_live boolean default false,
  created_by uuid references public.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  languages text[] not null default '{}'::text[]
);

-- Enable RLS
alter table public.services enable row level security;

-- Service sessions table
create table public.service_sessions (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references public.services(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  session_id text not null,
  language text not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.service_sessions enable row level security;

-- RLS Policies
create policy "Users can view their own data"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users
  for update
  using (auth.uid() = id);

create policy "Anyone can view services"
  on public.services
  for select
  to authenticated
  using (true);

create policy "Users can create services"
  on public.services
  for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Users can update their own services"
  on public.services
  for update
  using (auth.uid() = created_by);

create policy "Users can delete their own services"
  on public.services
  for delete
  using (auth.uid() = created_by);

create policy "Anyone can view service sessions"
  on public.service_sessions
  for select
  to authenticated
  using (true);

create policy "Anyone can create service sessions"
  on public.service_sessions
  for insert
  to authenticated
  with check (true);

create policy "Anyone can update their own sessions"
  on public.service_sessions
  for update
  using (session_id = current_setting('app.session_id', true));

create policy "Anyone can delete their own sessions"
  on public.service_sessions
  for delete
  using (session_id = current_setting('app.session_id', true));