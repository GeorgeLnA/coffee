-- Add label customization fields to coffee_products table

-- Also add flavor_notes_array text[] to store parsed flavor notes

begin;

-- Add flavor_notes_array column (text array)
alter table public.coffee_products
add column if not exists flavor_notes_array text[];

-- Add custom_label column for custom product labels
alter table public.coffee_products
add column if not exists custom_label text;

-- Add custom label color columns
alter table public.coffee_products
add column if not exists custom_label_color text default '#f59e0b';

alter table public.coffee_products
add column if not exists custom_label_text_color text default '#92400e';

-- Optional: create GIN index if filtering by notes later
do $$
begin
  if not exists (
    select 1 from pg_indexes 
    where schemaname = 'public' and indexname = 'idx_coffee_products_flavor_notes_array'
  ) then
    create index idx_coffee_products_flavor_notes_array on public.coffee_products using gin (flavor_notes_array);
  end if;
end $$;

commit;

-- Per-size image support and special styling
begin;

alter table public.coffee_sizes
add column if not exists image_url text;

alter table public.coffee_sizes
add column if not exists special boolean default false;

commit;
-- This migration adds support for custom coffee labels with patterns and colors

begin;

-- Add new columns to coffee_products table
alter table public.coffee_products 
add column if not exists strength_level integer default 3,
add column if not exists acidity_level integer default 3,
add column if not exists roast_level integer default 3,
add column if not exists body_level integer default 3,
add column if not exists label_data jsonb;

-- Add constraints for level fields (1-5 range) - using DO blocks for idempotent constraint creation
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coffee_strength_level_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products 
    add constraint coffee_strength_level_check 
    check (strength_level is null or (strength_level >= 1 and strength_level <= 5));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coffee_acidity_level_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products 
    add constraint coffee_acidity_level_check 
    check (acidity_level is null or (acidity_level >= 1 and acidity_level <= 5));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coffee_roast_level_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products 
    add constraint coffee_roast_level_check 
    check (roast_level is null or (roast_level >= 1 and roast_level <= 5));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coffee_body_level_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products 
    add constraint coffee_body_level_check 
    check (body_level is null or (body_level >= 1 and body_level <= 5));
  end if;
end $$;

-- Add constraint for label_data JSON structure
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coffee_label_data_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products 
    add constraint coffee_label_data_check 
    check (
      label_data is null or (
        label_data ? 'template' and
        label_data ? 'size' and
        label_data->>'template' in ('classic', 'caramel', 'emerald', 'indigo', 'crimson', 'gold', 'custom') and
        label_data->>'size' in ('small', 'medium', 'large') and
        (
          label_data->>'template' != 'custom' or 
          (label_data ? 'customColors' and 
           label_data->'customColors' ? 'bg' and
           label_data->'customColors' ? 'text' and
           label_data->'customColors' ? 'accent')
        ) and
        (
          not (label_data ? 'pattern') or
          label_data->>'pattern' in ('dots', 'stripes', 'grid', 'geometric', 'waves', 'stars', 'leaves', 'diamonds', 'lines')
        )
      )
    );
  end if;
end $$;

-- Create index for label_data queries
create index if not exists idx_coffee_products_label_data 
on public.coffee_products using gin (label_data);

-- Create index for level fields for filtering
create index if not exists idx_coffee_products_strength_level 
on public.coffee_products (strength_level) where strength_level is not null;

create index if not exists idx_coffee_products_acidity_level 
on public.coffee_products (acidity_level) where acidity_level is not null;

create index if not exists idx_coffee_products_roast_level 
on public.coffee_products (roast_level) where roast_level is not null;

create index if not exists idx_coffee_products_body_level 
on public.coffee_products (body_level) where body_level is not null;

commit;
