-- Rootling database schema.
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run again after changes: it only creates what is missing and
-- replaces policies and functions.
--
-- Rules this schema enforces:
--   * Accounts belong to parents (Supabase Auth users). Children never log in.
--   * Every table has Row Level Security on, so a parent can only ever read or
--     change their own family.
--   * Per child we keep only a first name, age, favourite topics, language,
--     family member and learning progress.
--   * The waitlist can be joined from the browser but never read from it.
--   * Subscriptions are written only by the Stripe webhook (service role).

-- ---------------------------------------------------------------- waitlist
create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null check (char_length(email) between 3 and 254 and email like '%_@_%'),
  language text not null check (char_length(language) between 2 and 40),
  country text check (country is null or char_length(country) <= 60),
  created_at timestamptz not null default now()
);
create unique index if not exists waitlist_email_language on public.waitlist (lower(email), language);

alter table public.waitlist enable row level security;
drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist" on public.waitlist
  for insert to anon, authenticated with check (true);
-- No select, update or delete policies: the list is only visible in the Supabase dashboard.

-- ---------------------------------------------------------------- parents
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- When the parent confirmed they are the parent or guardian and agreed to the privacy policy.
  consent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Parents read their profile" on public.profiles;
create policy "Parents read their profile" on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists "Parents create their profile" on public.profiles;
create policy "Parents create their profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());
drop policy if exists "Parents update their profile" on public.profiles;
create policy "Parents update their profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Create a profile row for every new parent account.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- children
create table if not exists public.children (
  -- Created on the device (so it works offline), then synced.
  id uuid primary key,
  parent_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 20),
  age smallint not null check (age between 3 and 10),
  favourites text[] not null default '{}',
  course_code text not null check (char_length(course_code) between 2 and 5),
  elder_by_course jsonb not null default '{}',
  show_roman boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists children_parent on public.children (parent_id);

alter table public.children enable row level security;
drop policy if exists "Parents manage their children" on public.children;
create policy "Parents manage their children" on public.children
  for all to authenticated using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- At most 4 children per parent.
create or replace function public.limit_children() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Upserts of an existing child also fire insert triggers; those are updates, not new children.
  if exists (select 1 from public.children where id = new.id) then
    return new;
  end if;
  if (select count(*) from public.children where parent_id = new.parent_id) >= 4 then
    raise exception 'A family can have up to 4 children';
  end if;
  return new;
end;
$$;
drop trigger if exists children_limit on public.children;
create trigger children_limit before insert on public.children
  for each row execute function public.limit_children();

-- ---------------------------------------------------------------- progress
create table if not exists public.progress (
  child_id uuid primary key references public.children (id) on delete cascade,
  parent_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- Words learned, lessons and stories finished, minutes per day, streak and milestones.
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
create index if not exists progress_parent on public.progress (parent_id);

alter table public.progress enable row level security;
drop policy if exists "Parents manage their children's progress" on public.progress;
create policy "Parents manage their children's progress" on public.progress
  for all to authenticated
  using (parent_id = auth.uid())
  with check (
    parent_id = auth.uid()
    and exists (select 1 from public.children c where c.id = child_id and c.parent_id = auth.uid())
  );

-- ---------------------------------------------------------------- subscriptions
create table if not exists public.subscriptions (
  parent_id uuid primary key references public.profiles (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  -- Stripe's status: trialing, active, past_due, canceled, incomplete, unpaid…
  status text not null default 'free',
  trial_end timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  -- Set once a family has had a free month, so the trial is offered only once.
  had_trial boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
drop policy if exists "Parents read their subscription" on public.subscriptions;
create policy "Parents read their subscription" on public.subscriptions
  for select to authenticated using (parent_id = auth.uid());
-- No insert/update/delete policies: only the server (service role key) writes here.
