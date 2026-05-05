
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age int,
  weight_kg numeric,
  height_cm numeric,
  fitness_level text,
  equipment text,
  goal text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- Plans table (one active plan per user, 14-day JSON)
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text not null,
  start_date date not null default current_date,
  days jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;
create index on public.plans (user_id, created_at desc);

create policy "users view own plans" on public.plans for select using (auth.uid() = user_id);
create policy "users insert own plans" on public.plans for insert with check (auth.uid() = user_id);
create policy "users update own plans" on public.plans for update using (auth.uid() = user_id);
create policy "users delete own plans" on public.plans for delete using (auth.uid() = user_id);

-- Completions table
create table public.completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  day_index int not null,
  exercise_index int not null,
  completed boolean not null default true,
  photo_url text,
  edited_name text,
  created_at timestamptz not null default now(),
  unique (plan_id, day_index, exercise_index)
);

alter table public.completions enable row level security;
create index on public.completions (user_id, plan_id);

create policy "users view own completions" on public.completions for select using (auth.uid() = user_id);
create policy "users insert own completions" on public.completions for insert with check (auth.uid() = user_id);
create policy "users update own completions" on public.completions for update using (auth.uid() = user_id);
create policy "users delete own completions" on public.completions for delete using (auth.uid() = user_id);

-- Auto-create profile on signup using metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, age, weight_kg, height_cm, fitness_level, equipment, goal)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Friend'),
    nullif(new.raw_user_meta_data->>'age','')::int,
    nullif(new.raw_user_meta_data->>'weight_kg','')::numeric,
    nullif(new.raw_user_meta_data->>'height_cm','')::numeric,
    new.raw_user_meta_data->>'fitness_level',
    new.raw_user_meta_data->>'equipment',
    coalesce(new.raw_user_meta_data->>'goal', 'lose_weight')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
