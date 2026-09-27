-- Discount codes (features.coupons). Paste into Supabase -> SQL Editor -> Run. Safe to re-run.

create table if not exists public.coupons (
	id uuid primary key default gen_random_uuid(),
	code text unique not null,
	discount_type text not null check (discount_type in ('percent', 'flat')),
	discount_value numeric(10, 2) not null,
	is_active boolean not null default true,
	expires_at timestamptz,
	max_uses int,
	used_count int not null default 0,
	min_order_eur numeric(10, 2),
	created_at timestamptz not null default now()
);

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_eur numeric(10, 2);

-- Codes must NOT be readable by anon (no enumeration). Admin-only table access;
-- the public validates a code through the security-definer RPC below.
alter table public.coupons enable row level security;
drop policy if exists "admin_all_coupons" on public.coupons;
create policy "admin_all_coupons" on public.coupons
	for all to authenticated using (true) with check (true);

-- Validate a code for a given subtotal. Returns jsonb (valid + discount, or reason).
create or replace function public.validate_coupon(p_code text, p_subtotal numeric)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
	c public.coupons;
	d numeric;
begin
	select * into c from public.coupons where lower(code) = lower(btrim(p_code));
	if not found then return jsonb_build_object('valid', false, 'reason', 'not_found'); end if;
	if not c.is_active then return jsonb_build_object('valid', false, 'reason', 'inactive'); end if;
	if c.expires_at is not null and c.expires_at < now() then
		return jsonb_build_object('valid', false, 'reason', 'expired');
	end if;
	if c.max_uses is not null and c.used_count >= c.max_uses then
		return jsonb_build_object('valid', false, 'reason', 'used_up');
	end if;
	if c.min_order_eur is not null and p_subtotal < c.min_order_eur then
		return jsonb_build_object('valid', false, 'reason', 'min_order', 'min_order_eur', c.min_order_eur);
	end if;
	if c.discount_type = 'percent' then
		d := round(p_subtotal * c.discount_value / 100.0, 2);
	else
		d := c.discount_value;
	end if;
	if d > p_subtotal then d := p_subtotal; end if;
	return jsonb_build_object('valid', true, 'discount_eur', d, 'code', c.code);
end;
$$;

revoke execute on function public.validate_coupon(text, numeric) from public;
grant execute on function public.validate_coupon(text, numeric) to anon, authenticated;

-- Count a redemption when an order carrying a code is inserted.
create or replace function public.bump_coupon_use()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	if new.coupon_code is not null then
		update public.coupons set used_count = used_count + 1 where lower(code) = lower(new.coupon_code);
	end if;
	return new;
end;
$$;

drop trigger if exists orders_bump_coupon on public.orders;
create trigger orders_bump_coupon after insert on public.orders
	for each row execute function public.bump_coupon_use();
