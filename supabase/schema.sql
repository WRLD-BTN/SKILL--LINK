create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique,
  phone text unique not null,
  full_name text not null,
  role text not null check (role in ('client', 'tradesperson', 'admin')) default 'client',
  location_city text,
  location_suburb text,
  whatsapp_number text,
  avatar_url text,
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.tradesperson_profiles (
  id uuid primary key references public.users(id) on delete cascade,
  bio text,
  years_experience integer default 0,
  hourly_rate numeric(10, 2),
  fixed_rate numeric(10, 2),
  availability_status text default 'available',
  portfolio_photos text[],
  rating_avg numeric(3, 2) default 0,
  total_reviews integer default 0,
  total_jobs_completed integer default 0
);

create table if not exists public.skills (
  id serial primary key,
  name text unique not null,
  category text,
  icon text
);

insert into public.skills (name, category, icon)
values
  ('Plumber', 'Home Services', 'wrench'),
  ('Electrician', 'Home Services', 'bolt'),
  ('Carpenter', 'Home Services', 'hammer'),
  ('Mechanic', 'Auto', 'tool'),
  ('Gardener', 'Outdoor', 'leaf'),
  ('Painter', 'Home Services', 'brush'),
  ('Welder', 'Construction', 'flame'),
  ('Mason', 'Construction', 'bricks'),
  ('Tiler', 'Construction', 'grid'),
  ('Roofer', 'Construction', 'house')
on conflict (name) do nothing;

create table if not exists public.tradesperson_skills (
  id serial primary key,
  tradesperson_id uuid not null references public.users(id) on delete cascade,
  skill_id integer not null references public.skills(id) on delete cascade,
  unique (tradesperson_id, skill_id)
);

create table if not exists public.jobs (
  id bigserial primary key,
  client_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  skill_id integer references public.skills(id),
  location_city text,
  location_suburb text,
  budget_min numeric(10, 2),
  budget_max numeric(10, 2),
  urgency text default 'flexible',
  status text default 'open',
  created_at timestamp with time zone default now()
);

create table if not exists public.job_applications (
  id bigserial primary key,
  job_id bigint not null references public.jobs(id) on delete cascade,
  tradesperson_id uuid not null references public.users(id) on delete cascade,
  cover_message text,
  proposed_rate numeric(10, 2),
  status text default 'pending',
  created_at timestamp with time zone default now(),
  unique (job_id, tradesperson_id)
);

create table if not exists public.reviews (
  id bigserial primary key,
  job_id bigint not null references public.jobs(id) on delete cascade,
  reviewer_id uuid not null references public.users(id) on delete cascade,
  reviewed_user_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now()
);

create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.users enable row level security;
alter table public.tradesperson_profiles enable row level security;
alter table public.tradesperson_skills enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

create policy "Users can view active profiles"
on public.users
for select
using (is_active = true);

create policy "Users can manage own profile"
on public.users
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Anyone can view jobs"
on public.jobs
for select
using (true);

create policy "Clients can manage own jobs"
on public.jobs
for all
using (auth.uid() = client_id)
with check (auth.uid() = client_id);

create policy "Tradespeople can view applications they submitted"
on public.job_applications
for select
using (auth.uid() = tradesperson_id);

create policy "Tradespeople can create applications"
on public.job_applications
for insert
with check (auth.uid() = tradesperson_id);

create policy "Clients can view applications on their jobs"
on public.job_applications
for select
using (
  exists (
    select 1
    from public.jobs
    where jobs.id = job_applications.job_id
      and jobs.client_id = auth.uid()
  )
);

create table if not exists public.phone_verification_logs (
  id bigserial primary key,
  phone text not null,
  delivery_provider text not null default 'africas_talking',
  status text not null default 'requested',
  created_at timestamp with time zone default now()
);
