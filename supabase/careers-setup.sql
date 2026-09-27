-- "Стани част от канала" (features.careers): open positions + applications + private CV bucket.
-- Paste into Supabase -> SQL Editor -> Run. Safe to re-run.

create table if not exists public.positions (
	id uuid primary key default gen_random_uuid(),
	title_bg text not null,
	title_en text not null,
	description_bg text,
	description_en text,
	is_open boolean not null default true,
	sort_order int not null default 0,
	created_at timestamptz not null default now()
);

create table if not exists public.applications (
	id uuid primary key default gen_random_uuid(),
	position_id uuid references public.positions(id) on delete set null,
	name text not null,
	email text not null,
	phone text,
	message text,
	cv_path text,
	cv_name text,
	status text not null default 'new',
	created_at timestamptz not null default now()
);

alter table public.positions enable row level security;
alter table public.applications enable row level security;

-- positions: public read, admin write
drop policy if exists "public_read_positions" on public.positions;
create policy "public_read_positions" on public.positions
	for select to anon, authenticated using (true);
drop policy if exists "admin_write_positions" on public.positions;
create policy "admin_write_positions" on public.positions
	for all to authenticated using (true) with check (true);

-- applications: anon may only INSERT (public form, no select); admin has the rest
drop policy if exists "anon_insert_applications" on public.applications;
create policy "anon_insert_applications" on public.applications
	for insert to anon, authenticated with check (true);
drop policy if exists "admin_read_applications" on public.applications;
create policy "admin_read_applications" on public.applications
	for select to authenticated using (true);
drop policy if exists "admin_update_applications" on public.applications;
create policy "admin_update_applications" on public.applications
	for update to authenticated using (true);
drop policy if exists "admin_delete_applications" on public.applications;
create policy "admin_delete_applications" on public.applications
	for delete to authenticated using (true);

-- Private bucket for CV files (not public — admin downloads via signed URLs).
insert into storage.buckets (id, name, public)
values ('applications', 'applications', false)
on conflict (id) do nothing;

do $$
begin
	drop policy if exists "anon_upload_applications" on storage.objects;
	create policy "anon_upload_applications" on storage.objects
		for insert to anon, authenticated with check (bucket_id = 'applications');
	drop policy if exists "admin_read_application_files" on storage.objects;
	create policy "admin_read_application_files" on storage.objects
		for select to authenticated using (bucket_id = 'applications');
	drop policy if exists "admin_delete_application_files" on storage.objects;
	create policy "admin_delete_application_files" on storage.objects
		for delete to authenticated using (bucket_id = 'applications');
exception when insufficient_privilege then
	raise notice 'Add storage policies for bucket applications via Dashboard -> Storage -> Policies.';
end;
$$;
