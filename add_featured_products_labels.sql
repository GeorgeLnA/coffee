-- Add label fields to featured_products table

begin;

-- Add label fields
alter table public.featured_products
add column if not exists custom_label_ua text;

alter table public.featured_products
add column if not exists custom_label_ru text;

alter table public.featured_products
add column if not exists custom_label_color text default '#f59e0b';

alter table public.featured_products
add column if not exists custom_label_text_color text default '#92400e';

alter table public.featured_products
add column if not exists label_image_url text;

commit;

