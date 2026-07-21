-- ICOBA Voting Site — run this in the Supabase SQL Editor

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  is_admin boolean not null default false,
  votes_submitted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Single-row election settings (manual open/close from admin)
create table public.election_settings (
  id int primary key default 1 check (id = 1),
  is_open boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.election_settings (is_open) values (true);

-- Positions & Awards
create table public.positions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Nominees belong to exactly one position OR one award
create table public.nominees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  house text not null,
  photo_url text,
  position_id uuid references public.positions (id) on delete cascade,
  award_id uuid references public.awards (id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint nominee_category_check check (
    (position_id is not null and award_id is null)
    or (position_id is null and award_id is not null)
  )
);

-- Auto-saved draft picks (user can change before final submit)
create table public.draft_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nominee_id uuid not null references public.nominees (id) on delete cascade,
  position_id uuid references public.positions (id) on delete cascade,
  award_id uuid references public.awards (id) on delete cascade,
  updated_at timestamptz not null default now(),
  constraint draft_vote_category_check check (
    (position_id is not null and award_id is null)
    or (position_id is null and award_id is not null)
  )
);

create unique index draft_votes_user_position_idx
  on public.draft_votes (user_id, position_id)
  where position_id is not null;

create unique index draft_votes_user_award_idx
  on public.draft_votes (user_id, award_id)
  where award_id is not null;

-- Locked final votes (copied from drafts on submit)
create table public.final_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nominee_id uuid not null references public.nominees (id) on delete cascade,
  position_id uuid references public.positions (id) on delete cascade,
  award_id uuid references public.awards (id) on delete cascade,
  submitted_at timestamptz not null default now(),
  constraint final_vote_category_check check (
    (position_id is not null and award_id is null)
    or (position_id is null and award_id is not null)
  )
);

create unique index final_votes_user_position_idx
  on public.final_votes (user_id, position_id)
  where position_id is not null;

create unique index final_votes_user_award_idx
  on public.final_votes (user_id, award_id)
  where award_id is not null;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is election open?
create or replace function public.election_is_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_open from public.election_settings where id = 1;
$$;

-- Allowlisted admin emails (works even if profiles.is_admin was not set)
create table if not exists public.admin_emails (
  email text primary key
);

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(
      (select is_admin from public.profiles where id = auth.uid()),
      false
    )
    or exists (
      select 1
      from public.admin_emails ae
      join auth.users u on lower(u.email) = lower(ae.email)
      where u.id = auth.uid()
    );
$$;

-- Expose tables to the Data API (needed when "Automatically expose new tables" is OFF)
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to anon, authenticated, service_role;

grant usage, select on all sequences in schema public
  to anon, authenticated, service_role;

grant execute on all functions in schema public
  to anon, authenticated, service_role;

-- RLS
alter table public.profiles enable row level security;
alter table public.election_settings enable row level security;
alter table public.positions enable row level security;
alter table public.awards enable row level security;
alter table public.nominees enable row level security;
alter table public.draft_votes enable row level security;
alter table public.final_votes enable row level security;

-- Profiles
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile (not admin flag)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Election settings: everyone can read, admins can update
create policy "Anyone authenticated can read election settings"
  on public.election_settings for select
  to authenticated
  using (true);

create policy "Admins can update election settings"
  on public.election_settings for update
  to authenticated
  using (public.is_admin());

-- Positions, awards, nominees: read for authenticated, write for admin
create policy "Authenticated users can read positions"
  on public.positions for select to authenticated using (true);

create policy "Admins manage positions"
  on public.positions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Authenticated users can read awards"
  on public.awards for select to authenticated using (true);

create policy "Admins manage awards"
  on public.awards for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Authenticated users can read nominees"
  on public.nominees for select to authenticated using (true);

create policy "Admins manage nominees"
  on public.nominees for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Draft votes: users manage own drafts while election open & not submitted
create policy "Users read own draft votes"
  on public.draft_votes for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users insert own draft votes"
  on public.draft_votes for insert
  with check (
    auth.uid() = user_id
    and public.election_is_open()
    and not exists (
      select 1 from public.profiles
      where id = auth.uid() and votes_submitted_at is not null
    )
  );

create policy "Users update own draft votes"
  on public.draft_votes for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and public.election_is_open()
    and not exists (
      select 1 from public.profiles
      where id = auth.uid() and votes_submitted_at is not null
    )
  );

create policy "Users delete own draft votes"
  on public.draft_votes for delete
  using (auth.uid() = user_id);

-- Final votes: users read own, insert once on submit
create policy "Users read own final votes"
  on public.final_votes for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users insert own final votes"
  on public.final_votes for insert
  with check (auth.uid() = user_id);

create policy "Admins read all final votes"
  on public.final_votes for select
  using (public.is_admin());

-- Storage bucket for nominee photos:
-- Also run supabase/storage.sql in the SQL Editor (creates public bucket + policies)
