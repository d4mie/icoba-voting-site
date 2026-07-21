-- Nominee photo storage — run once in the Supabase SQL Editor

insert into storage.buckets (id, name, public)
values ('nominee-photos', 'nominee-photos', true)
on conflict (id) do update set public = true;

-- Anyone can view photos (needed for voter pages)
drop policy if exists "Public read nominee photos" on storage.objects;
create policy "Public read nominee photos"
  on storage.objects for select
  using (bucket_id = 'nominee-photos');

-- Admins can upload photos
drop policy if exists "Admins upload nominee photos" on storage.objects;
create policy "Admins upload nominee photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'nominee-photos' and public.is_admin());

-- Admins can replace/delete photos
drop policy if exists "Admins update nominee photos" on storage.objects;
create policy "Admins update nominee photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'nominee-photos' and public.is_admin());

drop policy if exists "Admins delete nominee photos" on storage.objects;
create policy "Admins delete nominee photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'nominee-photos' and public.is_admin());
