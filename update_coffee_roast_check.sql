begin;

-- Drop existing roast check constraint if present
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'coffee_roast_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products drop constraint coffee_roast_check;
  end if;
end $$;

-- Allow any non-empty string so admin-defined roasts work
alter table public.coffee_products
add constraint coffee_roast_check
check (
  roast is null or length(trim(roast)) > 0
);

commit;


