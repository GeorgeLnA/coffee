-- Add Russian version of custom_label field
alter table public.coffee_products add column if not exists custom_label_ru text;

