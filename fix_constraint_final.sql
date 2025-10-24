-- Final fix for coffee_label_data_check constraint

begin;

-- Drop the existing constraint
alter table public.coffee_products 
drop constraint if exists coffee_label_data_check;

-- Add a much simpler constraint that just checks basic structure
alter table public.coffee_products 
add constraint coffee_label_data_check 
check (
  label_data is null or (
    label_data ? 'template' and
    label_data ? 'size' and
    label_data->>'template' in ('classic', 'caramel', 'emerald', 'indigo', 'crimson', 'gold', 'vintage', 'minimal', 'geometric', 'organic', 'luxury', 'custom') and
    label_data->>'size' in ('small', 'medium', 'large')
  )
);

commit;
