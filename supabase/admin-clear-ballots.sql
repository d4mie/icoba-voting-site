-- Run once in Supabase SQL Editor
-- Lets admins clear one ballot or reset all submitted ballots

-- Allow admins (only) to unlock a submitted ballot
create or replace function public.protect_submitted_votes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.votes_submitted_at is not null
     and new.votes_submitted_at is distinct from old.votes_submitted_at
     and not public.is_admin() then
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

-- Clear one voter's submitted ballot (and unlock them to vote again)
create or replace function public.admin_clear_ballot(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  delete from public.final_votes where user_id = target_user_id;
  delete from public.draft_votes where user_id = target_user_id;

  update public.profiles
  set votes_submitted_at = null
  where id = target_user_id;
end;
$$;

-- Clear every submitted ballot
create or replace function public.admin_clear_all_ballots()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  delete from public.final_votes;

  update public.profiles
  set votes_submitted_at = null
  where votes_submitted_at is not null;
end;
$$;

grant execute on function public.admin_clear_ballot(uuid) to authenticated;
grant execute on function public.admin_clear_all_ballots() to authenticated;
