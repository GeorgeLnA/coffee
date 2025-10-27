-- Add aftertaste fields (UA/RU) to coffee_products
-- Safe, idempotent migration

do $$ begin
  begin
    alter table public.coffee_products
      add column if not exists aftertaste_ua text[];
  exception when others then null; end;

  begin
    alter table public.coffee_products
      add column if not exists aftertaste_ru text[];
  exception when others then null; end;
end $$;

-- Create GIN indexes for fast filtering/searching
do $$ begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'idx_coffee_products_aftertaste_ua'
  ) then
    create index idx_coffee_products_aftertaste_ua on public.coffee_products using gin (aftertaste_ua);
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'idx_coffee_products_aftertaste_ru'
  ) then
    create index idx_coffee_products_aftertaste_ru on public.coffee_products using gin (aftertaste_ru);
  end if;
end $$;


