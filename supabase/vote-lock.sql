-- Run once in Supabase SQL Editor
-- 1) Lock ballots so users cannot vote twice / unlock themselves
-- 2) Let admins read all voter profiles for the ballots list

create or replace function public.protect_submitted_votes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.votes_submitted_at is not null
     and new.votes_submitted_at is distinct from old.votes_submitted_at then
    raise exception 'Votes already submitted and cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_submitted_votes_trigger on public.profiles;
create trigger protect_submitted_votes_trigger
  before update on public.profiles
  for each row
  execute function public.protect_submitted_votes();

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());
