-- Sports Hub Supabase bootstrap schema
-- Run this in Supabase SQL Editor after creating your project.

create extension if not exists "pgcrypto";

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  teams jsonb not null default '[]'::jsonb,
  news_sources jsonb not null default '{}'::jsonb,
  news_count integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.update_updated_at_column();

alter table public.user_settings enable row level security;

drop policy if exists "Users can read own settings" on public.user_settings;
create policy "Users can read own settings"
on public.user_settings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
on public.user_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
on public.user_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
