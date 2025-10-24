-- Fix coffee_label_data_check constraint to include all template types

begin;

-- Drop the existing constraint
alter table public.coffee_products 
drop constraint if exists coffee_label_data_check;

-- Add the updated constraint with all template types
alter table public.coffee_products 
add constraint coffee_label_data_check 
check (
  label_data is null or (
    label_data ? 'template' and
    label_data ? 'size' and
    label_data->>'template' in ('classic', 'caramel', 'emerald', 'indigo', 'crimson', 'gold', 'vintage', 'minimal', 'geometric', 'organic', 'luxury', 'custom') and
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

commit;
