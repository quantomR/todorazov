-- Storefront template — Supabase schema
-- Run the whole script in the Supabase SQL editor (idempotent).
-- Prices are stored in EUR only; BGN is derived in the app (x 1.95583).

create extension if not exists pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.categories (
	id uuid primary key default gen_random_uuid(),
	name_bg text not null,
	name_en text not null,
	sort_order int not null default 0,
	created_at timestamptz not null default now()
);

create table if not exists public.products (
	id uuid primary key default gen_random_uuid(),
	category_id uuid references public.categories(id) on delete set null,
	sku text unique not null,
	name_bg text not null,
	name_en text not null,
	description_bg text,
	description_en text,
	price_eur numeric(10,2) not null default 0,
	-- Sale pricing (features.sales). discount_type null = no active discount.
	discount_type text check (discount_type in ('percent', 'flat')),
	discount_value numeric(10,2),
	has_colors boolean not null default false,
	has_sizes boolean not null default false,
	is_active boolean not null default true,
	featured boolean not null default false,
	-- Per-product SEO overrides (fall back to name/description when null).
	meta_title_bg text,
	meta_title_en text,
	meta_description_bg text,
	meta_description_en text,
	-- Card image framing (features: focal-point picker).
	card_image_fit text not null default 'cover' check (card_image_fit in ('cover', 'contain')),
	card_image_focus text not null default '50% 50%',
	-- Optional product video (features.video): YouTube/Vimeo/mp4 URL.
	video_url text,
	-- Rating aggregate (features.reviews), maintained by a trigger.
	rating numeric(2,1) not null default 0,
	review_count int not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

-- Idempotent column adds, so re-running the script upgrades an existing DB.
alter table public.products add column if not exists discount_type text;
alter table public.products add column if not exists discount_value numeric(10,2);
alter table public.products add column if not exists meta_title_bg text;
alter table public.products add column if not exists meta_title_en text;
alter table public.products add column if not exists meta_description_bg text;
alter table public.products add column if not exists meta_description_en text;
alter table public.products add column if not exists card_image_fit text not null default 'cover';
alter table public.products add column if not exists card_image_focus text not null default '50% 50%';
alter table public.products add column if not exists video_url text;
alter table public.products add column if not exists rating numeric(2,1) not null default 0;
alter table public.products add column if not exists review_count int not null default 0;
do $$ begin
	if not exists (select 1 from pg_constraint where conname = 'products_discount_type_check') then
		alter table public.products add constraint products_discount_type_check
			check (discount_type is null or discount_type in ('percent', 'flat'));
	end if;
	if not exists (select 1 from pg_constraint where conname = 'products_card_image_fit_check') then
		alter table public.products add constraint products_card_image_fit_check
			check (card_image_fit in ('cover', 'contain'));
	end if;
end $$;

create table if not exists public.product_colors (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products(id) on delete cascade,
	name_bg text not null,
	name_en text not null,
	color_hex text not null,
	price_override_eur numeric(10,2),
	sort_order int not null default 0,
	created_at timestamptz not null default now()
);

create table if not exists public.product_sizes (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products(id) on delete cascade,
	label text not null,
	sort_order int not null default 0,
	created_at timestamptz not null default now(),
	unique (product_id, label)
);

create table if not exists public.product_images (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products(id) on delete cascade,
	color_id uuid references public.product_colors(id) on delete cascade,
	image_url text not null,
	storage_path text not null,
	sort_order int not null default 0,
	created_at timestamptz not null default now()
);

create table if not exists public.attribute_definitions (
	id uuid primary key default gen_random_uuid(),
	name_bg text not null,
	name_en text not null,
	sort_order int not null default 0,
	collapsed boolean not null default false,
	created_at timestamptz not null default now()
);

create table if not exists public.product_attributes (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products(id) on delete cascade,
	definition_id uuid references public.attribute_definitions(id) on delete cascade,
	name_bg text,
	name_en text,
	value_bg text,
	value_en text,
	sort_order int not null default 0,
	collapsed boolean not null default false,
	created_at timestamptz not null default now(),
	check (definition_id is not null or (name_bg is not null and name_en is not null))
);

create unique index if not exists product_attributes_product_definition_uidx
	on public.product_attributes (product_id, definition_id)
	where definition_id is not null;

-- ============================================================
-- Faceted filters (features.filters)
-- A filter group is one parameter (e.g. "Size", "Height"); category_id
-- scopes it to a category (null = applies to every category). type:
--   'checkbox' -> discrete values in filter_options, matched via
--                 product_filter_options (product has ANY selected option).
--   'range'    -> a numeric value per product in product_filter_values,
--                 matched against a min/max range in the shop.
-- ============================================================
create table if not exists public.filter_groups (
	id uuid primary key default gen_random_uuid(),
	category_id uuid references public.categories(id) on delete cascade,
	name_bg text not null,
	name_en text not null,
	type text not null default 'checkbox' check (type in ('checkbox', 'range')),
	unit text not null default '',
	sort_order int not null default 0,
	created_at timestamptz not null default now()
);

create table if not exists public.filter_options (
	id uuid primary key default gen_random_uuid(),
	group_id uuid not null references public.filter_groups(id) on delete cascade,
	value_bg text not null,
	value_en text not null,
	sort_order int not null default 0,
	created_at timestamptz not null default now()
);

create table if not exists public.product_filter_options (
	product_id uuid not null references public.products(id) on delete cascade,
	option_id uuid not null references public.filter_options(id) on delete cascade,
	primary key (product_id, option_id)
);

create table if not exists public.product_filter_values (
	product_id uuid not null references public.products(id) on delete cascade,
	group_id uuid not null references public.filter_groups(id) on delete cascade,
	value numeric not null,
	primary key (product_id, group_id)
);

create index if not exists filter_groups_category_idx on public.filter_groups (category_id);
create index if not exists filter_options_group_idx on public.filter_options (group_id);
create index if not exists product_filter_options_product_idx on public.product_filter_options (product_id);
create index if not exists product_filter_options_option_idx on public.product_filter_options (option_id);
create index if not exists product_filter_values_product_idx on public.product_filter_values (product_id);

create table if not exists public.orders (
	id uuid primary key default gen_random_uuid(),
	order_number text unique not null,
	client_name text not null,
	client_email text,
	client_phone text not null,
	delivery_address jsonb not null,
	items jsonb not null,
	total_eur numeric(10,2) not null,
	status text not null default 'new'
		check (status in ('new', 'confirmed', 'shipped', 'completed', 'cancelled')),
	-- Payment (features.payments). 'cod' = cash on delivery, 'card' = Stripe.
	payment_method text not null default 'cod' check (payment_method in ('cod', 'card')),
	payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
	stripe_session_id text,
	notes text,
	created_at timestamptz not null default now()
);

alter table public.orders add column if not exists payment_method text not null default 'cod';
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders add column if not exists stripe_session_id text;

create table if not exists public.inquiries (
	id uuid primary key default gen_random_uuid(),
	inquiry_number text unique not null,
	client_name text not null,
	client_email text not null,
	client_phone text,
	subject text,
	message text,
	status text not null default 'new' check (status in ('new', 'processed')),
	created_at timestamptz not null default now()
);

create table if not exists public.settings (
	key text primary key,
	value text
);

-- Weekly opening hours (features.hours). day 0 = Monday .. 6 = Sunday.
create table if not exists public.business_hours (
	day int primary key check (day between 0 and 6),
	hours text not null default '',
	closed boolean not null default false
);

-- Standalone categorized price list (features.services). price_eur null = "on request".
create table if not exists public.services (
	id uuid primary key default gen_random_uuid(),
	category_bg text not null default '',
	category_en text not null default '',
	name_bg text not null,
	name_en text not null,
	price_eur numeric(10,2),
	is_active boolean not null default true,
	sort_order int not null default 0,
	created_at timestamptz not null default now()
);

-- Product reviews (features.reviews). Public submissions start unapproved;
-- products.rating / review_count are kept in sync by a trigger.
create table if not exists public.reviews (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products(id) on delete cascade,
	author_name text not null,
	rating int not null check (rating between 1 and 5),
	comment text,
	is_approved boolean not null default false,
	created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on public.reviews (product_id);

-- Stripe webhook idempotency ledger (features.payments). Service-role only.
create table if not exists public.payment_events (
	id text primary key,
	created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active);
create index if not exists product_colors_product_idx on public.product_colors (product_id);
create index if not exists product_sizes_product_idx on public.product_sizes (product_id);
create index if not exists product_images_product_idx on public.product_images (product_id);
create index if not exists product_attributes_product_idx on public.product_attributes (product_id);

-- ============================================================
-- save_product RPC — product + colors + sizes + attributes in ONE
-- request/transaction.
-- payload: {
--   id?: uuid,                       -- ''/absent => insert
--   sku, name_bg, name_en, description_bg?, description_en?,
--   category_id?: uuid, price_eur,
--   has_colors, has_sizes, is_active, featured,
--   colors: [{ id (client-generated uuid for NEW rows too, so images
--              can reference them), name_bg, name_en, color_hex,
--              price_override_eur?, sort_order }],
--   sizes: [{ label, sort_order }],
--   attributes: [{ definition_id?, name_bg?, name_en?, value_bg?,
--                  value_en?, sort_order, collapsed }]
-- }
-- Colors are UPSERTED by id and missing ones deleted (a full
-- delete+reinsert would cascade-delete their images).
-- Sizes and attributes are replaced (nothing references them).
-- ============================================================

create or replace function public.save_product(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
	v_product_id uuid;
	v_has_colors boolean := coalesce((payload->>'has_colors')::boolean, false);
	v_has_sizes boolean := coalesce((payload->>'has_sizes')::boolean, false);
	item jsonb;
begin
	if coalesce(payload->>'id', '') = '' then
		insert into products (category_id, sku, name_bg, name_en, description_bg, description_en,
			price_eur, discount_type, discount_value, has_colors, has_sizes, is_active, featured,
			meta_title_bg, meta_title_en, meta_description_bg, meta_description_en,
			card_image_fit, card_image_focus, video_url)
		values (
			nullif(payload->>'category_id', '')::uuid,
			payload->>'sku',
			payload->>'name_bg',
			payload->>'name_en',
			payload->>'description_bg',
			payload->>'description_en',
			coalesce(nullif(payload->>'price_eur', '')::numeric, 0),
			nullif(payload->>'discount_type', ''),
			nullif(payload->>'discount_value', '')::numeric,
			v_has_colors,
			v_has_sizes,
			coalesce((payload->>'is_active')::boolean, true),
			coalesce((payload->>'featured')::boolean, false),
			nullif(payload->>'meta_title_bg', ''),
			nullif(payload->>'meta_title_en', ''),
			nullif(payload->>'meta_description_bg', ''),
			nullif(payload->>'meta_description_en', ''),
			coalesce(nullif(payload->>'card_image_fit', ''), 'cover'),
			coalesce(nullif(payload->>'card_image_focus', ''), '50% 50%'),
			nullif(payload->>'video_url', '')
		)
		returning id into v_product_id;
	else
		update products set
			category_id = nullif(payload->>'category_id', '')::uuid,
			sku = payload->>'sku',
			name_bg = payload->>'name_bg',
			name_en = payload->>'name_en',
			description_bg = payload->>'description_bg',
			description_en = payload->>'description_en',
			price_eur = coalesce(nullif(payload->>'price_eur', '')::numeric, 0),
			discount_type = nullif(payload->>'discount_type', ''),
			discount_value = nullif(payload->>'discount_value', '')::numeric,
			has_colors = v_has_colors,
			has_sizes = v_has_sizes,
			is_active = coalesce((payload->>'is_active')::boolean, true),
			featured = coalesce((payload->>'featured')::boolean, false),
			meta_title_bg = nullif(payload->>'meta_title_bg', ''),
			meta_title_en = nullif(payload->>'meta_title_en', ''),
			meta_description_bg = nullif(payload->>'meta_description_bg', ''),
			meta_description_en = nullif(payload->>'meta_description_en', ''),
			card_image_fit = coalesce(nullif(payload->>'card_image_fit', ''), 'cover'),
			card_image_focus = coalesce(nullif(payload->>'card_image_focus', ''), '50% 50%'),
			video_url = nullif(payload->>'video_url', ''),
			updated_at = now()
		where id = (payload->>'id')::uuid
		returning id into v_product_id;

		if v_product_id is null then
			raise exception 'Product % not found', payload->>'id';
		end if;
	end if;

	-- Colors: upsert by id, delete the ones no longer present
	if v_has_colors then
		for item in select * from jsonb_array_elements(coalesce(payload->'colors', '[]'::jsonb))
		loop
			insert into product_colors (id, product_id, name_bg, name_en, color_hex, price_override_eur, sort_order)
			values (
				(item->>'id')::uuid,
				v_product_id,
				item->>'name_bg',
				item->>'name_en',
				item->>'color_hex',
				nullif(item->>'price_override_eur', '')::numeric,
				coalesce((item->>'sort_order')::int, 0)
			)
			on conflict (id) do update set
				name_bg = excluded.name_bg,
				name_en = excluded.name_en,
				color_hex = excluded.color_hex,
				price_override_eur = excluded.price_override_eur,
				sort_order = excluded.sort_order;
		end loop;

		delete from product_colors
		where product_id = v_product_id
			and id not in (
				select (c->>'id')::uuid
				from jsonb_array_elements(coalesce(payload->'colors', '[]'::jsonb)) as c
			);
	else
		delete from product_colors where product_id = v_product_id;
	end if;

	-- Sizes: replace
	delete from product_sizes where product_id = v_product_id;
	if v_has_sizes then
		for item in select * from jsonb_array_elements(coalesce(payload->'sizes', '[]'::jsonb))
		loop
			insert into product_sizes (product_id, label, sort_order)
			values (v_product_id, item->>'label', coalesce((item->>'sort_order')::int, 0));
		end loop;
	end if;

	-- Attributes: replace
	delete from product_attributes where product_id = v_product_id;
	for item in select * from jsonb_array_elements(coalesce(payload->'attributes', '[]'::jsonb))
	loop
		insert into product_attributes
			(product_id, definition_id, name_bg, name_en, value_bg, value_en, sort_order, collapsed)
		values (
			v_product_id,
			nullif(item->>'definition_id', '')::uuid,
			item->>'name_bg',
			item->>'name_en',
			item->>'value_bg',
			item->>'value_en',
			coalesce((item->>'sort_order')::int, 0),
			coalesce((item->>'collapsed')::boolean, false)
		);
	end loop;

	-- Filter options (checkbox facets): replace
	delete from product_filter_options where product_id = v_product_id;
	for item in select * from jsonb_array_elements(coalesce(payload->'filter_options', '[]'::jsonb))
	loop
		insert into product_filter_options (product_id, option_id)
		values (v_product_id, (item#>>'{}')::uuid)
		on conflict do nothing;
	end loop;

	-- Filter range values: replace (skip blanks)
	delete from product_filter_values where product_id = v_product_id;
	for item in select * from jsonb_array_elements(coalesce(payload->'filter_values', '[]'::jsonb))
	loop
		if nullif(item->>'value', '') is not null then
			insert into product_filter_values (product_id, group_id, value)
			values (v_product_id, (item->>'group_id')::uuid, (item->>'value')::numeric)
			on conflict (product_id, group_id) do update set value = excluded.value;
		end if;
	end loop;

	return v_product_id;
end;
$$;

revoke execute on function public.save_product(jsonb) from public, anon;
grant execute on function public.save_product(jsonb) to authenticated;

-- ============================================================
-- save_filter_group RPC — a filter group + its options in ONE request.
-- payload: { id?, category_id?, name_bg, name_en, type, unit, sort_order,
--            options: [{ id (client uuid), value_bg, value_en, sort_order }] }
-- Options are upserted by id; missing ones are deleted. Returns the group id.
-- ============================================================
create or replace function public.save_filter_group(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
	v_group_id uuid;
	item jsonb;
begin
	if coalesce(payload->>'id', '') = '' then
		insert into filter_groups (category_id, name_bg, name_en, type, unit, sort_order)
		values (
			nullif(payload->>'category_id', '')::uuid,
			payload->>'name_bg',
			payload->>'name_en',
			coalesce(nullif(payload->>'type', ''), 'checkbox'),
			coalesce(payload->>'unit', ''),
			coalesce((payload->>'sort_order')::int, 0)
		)
		returning id into v_group_id;
	else
		update filter_groups set
			category_id = nullif(payload->>'category_id', '')::uuid,
			name_bg = payload->>'name_bg',
			name_en = payload->>'name_en',
			type = coalesce(nullif(payload->>'type', ''), 'checkbox'),
			unit = coalesce(payload->>'unit', ''),
			sort_order = coalesce((payload->>'sort_order')::int, 0)
		where id = (payload->>'id')::uuid
		returning id into v_group_id;

		if v_group_id is null then
			raise exception 'Filter group % not found', payload->>'id';
		end if;
	end if;

	for item in select * from jsonb_array_elements(coalesce(payload->'options', '[]'::jsonb))
	loop
		insert into filter_options (id, group_id, value_bg, value_en, sort_order)
		values (
			(item->>'id')::uuid,
			v_group_id,
			item->>'value_bg',
			item->>'value_en',
			coalesce((item->>'sort_order')::int, 0)
		)
		on conflict (id) do update set
			value_bg = excluded.value_bg,
			value_en = excluded.value_en,
			sort_order = excluded.sort_order;
	end loop;

	delete from filter_options
	where group_id = v_group_id
		and id not in (
			select (o->>'id')::uuid
			from jsonb_array_elements(coalesce(payload->'options', '[]'::jsonb)) as o
		);

	return v_group_id;
end;
$$;

revoke execute on function public.save_filter_group(jsonb) from public, anon;
grant execute on function public.save_filter_group(jsonb) to authenticated;

-- ============================================================
-- Product rating aggregate (features.reviews) — kept in sync from the
-- approved reviews via an after-change trigger.
-- ============================================================
create or replace function public.refresh_product_rating(p_product uuid)
returns void
language sql
security definer
set search_path = public
as $$
	update public.products p set
		rating = coalesce(
			(select round(avg(rating)::numeric, 1) from public.reviews
				where product_id = p_product and is_approved),
			0
		),
		review_count = (select count(*) from public.reviews
			where product_id = p_product and is_approved)
	where p.id = p_product;
$$;

create or replace function public.reviews_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	perform public.refresh_product_rating(coalesce(new.product_id, old.product_id));
	return null;
end;
$$;

drop trigger if exists reviews_rating_trigger on public.reviews;
create trigger reviews_rating_trigger
	after insert or update or delete on public.reviews
	for each row execute function public.reviews_after_change();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_sizes enable row level security;
alter table public.product_images enable row level security;
alter table public.attribute_definitions enable row level security;
alter table public.product_attributes enable row level security;
alter table public.orders enable row level security;
alter table public.inquiries enable row level security;
alter table public.settings enable row level security;
alter table public.business_hours enable row level security;
alter table public.services enable row level security;
alter table public.filter_groups enable row level security;
alter table public.filter_options enable row level security;
alter table public.product_filter_options enable row level security;
alter table public.product_filter_values enable row level security;
alter table public.reviews enable row level security;
alter table public.payment_events enable row level security;

do $$
declare
	t text;
begin
	foreach t in array array[
		'categories', 'products', 'product_colors', 'product_sizes',
		'product_images', 'attribute_definitions', 'product_attributes', 'settings',
		'business_hours', 'services', 'filter_groups', 'filter_options',
		'product_filter_options', 'product_filter_values'
	]
	loop
		execute format('drop policy if exists "public_read_%s" on public.%I', t, t);
		execute format(
			'create policy "public_read_%s" on public.%I for select to anon, authenticated using (true)',
			t, t
		);
		execute format('drop policy if exists "admin_write_%s" on public.%I', t, t);
		execute format(
			'create policy "admin_write_%s" on public.%I for all to authenticated using (true) with check (true)',
			t, t
		);
	end loop;
end;
$$;

-- Reviews: public reads only APPROVED rows; anon may submit (forced
-- unapproved); admin (authenticated) has full access incl. moderation.
-- payment_events has RLS on with NO policies — only the service role
-- (Stripe webhook) touches it.
do $$
begin
	drop policy if exists "reviews_public_read" on public.reviews;
	create policy "reviews_public_read" on public.reviews
		for select to anon, authenticated using (is_approved = true);

	drop policy if exists "reviews_anon_insert" on public.reviews;
	create policy "reviews_anon_insert" on public.reviews
		for insert to anon, authenticated with check (is_approved = false);

	drop policy if exists "reviews_admin_all" on public.reviews;
	create policy "reviews_admin_all" on public.reviews
		for all to authenticated using (true) with check (true);
end;
$$;

-- Orders & inquiries: anon may only insert (public forms insert
-- WITHOUT .select()); admin has full access.
do $$
declare
	t text;
begin
	foreach t in array array['orders', 'inquiries']
	loop
		execute format('drop policy if exists "anon_insert_%s" on public.%I', t, t);
		execute format(
			'create policy "anon_insert_%s" on public.%I for insert to anon, authenticated with check (true)',
			t, t
		);
		execute format('drop policy if exists "admin_read_%s" on public.%I', t, t);
		execute format(
			'create policy "admin_read_%s" on public.%I for select to authenticated using (true)',
			t, t
		);
		execute format('drop policy if exists "admin_update_%s" on public.%I', t, t);
		execute format(
			'create policy "admin_update_%s" on public.%I for update to authenticated using (true)',
			t, t
		);
		execute format('drop policy if exists "admin_delete_%s" on public.%I', t, t);
		execute format(
			'create policy "admin_delete_%s" on public.%I for delete to authenticated using (true)',
			t, t
		);
	end loop;
end;
$$;

-- ============================================================
-- Storage bucket
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- On some projects storage.objects is owned by supabase_storage_admin
-- and this block is not permitted from the SQL editor. It is wrapped so
-- the rest of the script still runs — in that case add the four
-- policies via Dashboard -> Storage -> Policies for bucket product-images:
-- select (public), insert/update/delete (authenticated).
do $$
begin
	drop policy if exists "public_read_product_images" on storage.objects;
	create policy "public_read_product_images" on storage.objects
		for select to anon, authenticated using (bucket_id = 'product-images');

	drop policy if exists "admin_insert_product_images" on storage.objects;
	create policy "admin_insert_product_images" on storage.objects
		for insert to authenticated with check (bucket_id = 'product-images');

	drop policy if exists "admin_update_product_images" on storage.objects;
	create policy "admin_update_product_images" on storage.objects
		for update to authenticated using (bucket_id = 'product-images');

	drop policy if exists "admin_delete_product_images" on storage.objects;
	create policy "admin_delete_product_images" on storage.objects
		for delete to authenticated using (bucket_id = 'product-images');
exception when insufficient_privilege then
	raise notice 'Could not create storage policies — add them via Dashboard -> Storage -> Policies for bucket product-images';
end;
$$;

-- ============================================================
-- Seed data (safe to delete after setup)
-- ============================================================

insert into public.settings (key, value) values
	('admin_email', ''),
	('contact_phone', ''),
	('contact_email', ''),
	('contact_address', ''),
	('show_bgn_price', 'true')
on conflict (key) do nothing;

-- Seed the 7 weekday rows (empty; edit in admin -> Settings when features.hours is on).
insert into public.business_hours (day, hours, closed) values
	(0, '', false), (1, '', false), (2, '', false), (3, '', false),
	(4, '', false), (5, '', false), (6, '', true)
on conflict (day) do nothing;

insert into public.categories (name_bg, name_en, sort_order)
select 'Продукти', 'Products', 0
where not exists (select 1 from public.categories);

-- Demo products: one plain, one colors-only, one colors x sizes
do $$
declare
	v_cat uuid;
	v_p uuid;
	v_c uuid;
begin
	if exists (select 1 from products) then
		return;
	end if;
	select id into v_cat from categories limit 1;

	insert into products (category_id, sku, name_bg, name_en, description_bg, description_en, price_eur)
	values (v_cat, 'DEMO-PLAIN', 'Обикновен продукт', 'Plain product',
		'Демо продукт без варианти.', 'Demo product without variants.', 19.90)
	returning id into v_p;

	insert into products (category_id, sku, name_bg, name_en, description_bg, description_en, price_eur, has_colors)
	values (v_cat, 'DEMO-COLORS', 'Продукт с цветове', 'Product with colors',
		'Демо продукт с цветови варианти.', 'Demo product with color variants.', 24.90, true)
	returning id into v_p;
	insert into product_colors (product_id, name_bg, name_en, color_hex, sort_order)
	values (v_p, 'Червен', 'Red', '#c0392b', 0), (v_p, 'Син', 'Blue', '#2980b9', 1);

	insert into products (category_id, sku, name_bg, name_en, description_bg, description_en, price_eur, has_colors, has_sizes)
	values (v_cat, 'DEMO-MERCH', 'Тениска', 'T-shirt',
		'Демо тениска с цветове и размери.', 'Demo t-shirt with colors and sizes.', 29.90, true, true)
	returning id into v_p;
	insert into product_colors (product_id, name_bg, name_en, color_hex, sort_order)
	values (v_p, 'Черен', 'Black', '#111111', 0) returning id into v_c;
	insert into product_colors (product_id, name_bg, name_en, color_hex, sort_order)
	values (v_p, 'Бял', 'White', '#f5f5f5', 1);
	insert into product_sizes (product_id, label, sort_order)
	values (v_p, 'S', 0), (v_p, 'M', 1), (v_p, 'L', 2), (v_p, 'XL', 3);
end;
$$;

-- Demo filters (features.filters): a checkbox group + a range group on the
-- demo category, with varied values across the demo products. Safe to delete.
do $$
declare
	v_cat uuid;
	v_size uuid;
	v_height uuid;
	v_opts uuid[];
	v_heights int[] := array[7, 16, 19];
	r record;
	i int := 0;
begin
	if exists (select 1 from filter_groups) then
		return;
	end if;
	select id into v_cat from categories limit 1;

	insert into filter_groups (category_id, name_bg, name_en, type, sort_order)
	values (v_cat, 'Размер', 'Size', 'checkbox', 0) returning id into v_size;
	insert into filter_options (group_id, value_bg, value_en, sort_order)
	values (v_size, 'Малък', 'Small', 0), (v_size, 'Среден', 'Medium', 1), (v_size, 'Голям', 'Large', 2);

	insert into filter_groups (category_id, name_bg, name_en, type, unit, sort_order)
	values (v_cat, 'Височина', 'Height', 'range', 'см', 1) returning id into v_height;

	select array_agg(id order by sort_order) into v_opts from filter_options where group_id = v_size;

	for r in select id from products order by created_at loop
		insert into product_filter_options (product_id, option_id)
		values (r.id, v_opts[(i % 3) + 1]) on conflict do nothing;
		insert into product_filter_values (product_id, group_id, value)
		values (r.id, v_height, v_heights[(i % 3) + 1]) on conflict do nothing;
		i := i + 1;
	end loop;
end;
$$;

-- Demo reviews (features.reviews) — approved, so ratings show. Safe to delete.
do $$
declare
	v_p uuid;
begin
	if exists (select 1 from reviews) then
		return;
	end if;
	for v_p in select id from products order by created_at limit 2 loop
		insert into reviews (product_id, author_name, rating, comment, is_approved) values
			(v_p, 'Мария', 5, 'Страхотен продукт, препоръчвам!', true),
			(v_p, 'Иван', 4, 'Добро качество за цената.', true);
	end loop;
end;
$$;

-- ============================================================
-- Careers (features.careers): open positions + applications + private CV bucket.
-- ============================================================
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

drop policy if exists "public_read_positions" on public.positions;
create policy "public_read_positions" on public.positions
	for select to anon, authenticated using (true);
drop policy if exists "admin_write_positions" on public.positions;
create policy "admin_write_positions" on public.positions
	for all to authenticated using (true) with check (true);

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
