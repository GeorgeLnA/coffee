-- Add sort field to coffee_products table for position control
-- This allows reordering products in admin and displaying them in order on coffee page

begin;

-- Add sort column to coffee_products table
alter table public.coffee_products 
add column if not exists sort integer default 0;

-- Create index for efficient sorting
create index if not exists idx_coffee_products_sort 
on public.coffee_products (sort) where sort is not null;

-- Update existing products to have sequential sort values
-- This ensures existing products have a proper order
do $$
declare
  product_record record;
  sort_counter integer := 1;
begin
  for product_record in 
    select id from public.coffee_products 
    order by id asc
  loop
    update public.coffee_products 
    set sort = sort_counter 
    where id = product_record.id;
    sort_counter := sort_counter + 1;
  end loop;
end $$;

-- Add constraint to ensure sort is non-negative
alter table public.coffee_products 
add constraint if not exists coffee_products_sort_check 
check (sort is null or sort >= 0);

commit;
