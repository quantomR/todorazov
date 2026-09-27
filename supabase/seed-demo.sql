-- Demo merch seed for Todor Azov (3 products with images).
-- Paste into Supabase → SQL Editor → Run. Safe to re-run (fixed SKUs).
-- Images are served from the deployed site (public/demo/*.jpg).

insert into public.categories (name_bg, name_en, sort_order)
values ('Мърч', 'Merch', 1)
on conflict do nothing;

with cat as (
	select id from public.categories where name_en = 'Merch' order by created_at limit 1
)
insert into public.products (category_id, sku, name_bg, name_en, price_eur, is_active, featured)
select cat.id, v.sku, v.name_bg, v.name_en, v.price, true, true
from cat, (values
	('DEMO-HOODIE', 'Суичър „Тодор Азов"', 'Todor Azov Hoodie', 49.90),
	('DEMO-TSHIRT', 'Тениска „Тодор Азов"', 'Todor Azov T-shirt', 24.90),
	('DEMO-BOOK',   'Книга „Тодор Азов"',  'Todor Azov Book',    19.90)
) as v(sku, name_bg, name_en, price)
on conflict (sku) do nothing;

insert into public.product_images (product_id, image_url, storage_path, sort_order)
select p.id, i.url, i.path, 0
from public.products p
join (values
	('DEMO-HOODIE', 'https://todorazov.vercel.app/demo/hoodie.jpg', 'demo/hoodie.jpg'),
	('DEMO-TSHIRT', 'https://todorazov.vercel.app/demo/tshirt.jpg', 'demo/tshirt.jpg'),
	('DEMO-BOOK',   'https://todorazov.vercel.app/demo/book.jpg',   'demo/book.jpg')
) as i(sku, url, path) on i.sku = p.sku
where not exists (select 1 from public.product_images pi where pi.product_id = p.id);
