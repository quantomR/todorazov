-- Book PDF preview (features.bookPreview): store the trimmed demo PDF per product.
-- Paste into Supabase -> SQL Editor -> Run. Safe to re-run.
alter table public.products add column if not exists preview_pdf_path text;
alter table public.products add column if not exists preview_pdf_pages int;
