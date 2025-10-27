-- Add SEO keywords (UA/RU) to coffee_products

do $$ begin
  begin
    alter table public.coffee_products
      add column if not exists seo_keywords_ua text[];
  exception when others then null; end;

  begin
    alter table public.coffee_products
      add column if not exists seo_keywords_ru text[];
  exception when others then null; end;
end $$;

-- Optional GIN indexes for array contains queries
do $$ begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'idx_coffee_products_seo_keywords_ua'
  ) then
    create index idx_coffee_products_seo_keywords_ua on public.coffee_products using gin (seo_keywords_ua);
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'idx_coffee_products_seo_keywords_ru'
  ) then
    create index idx_coffee_products_seo_keywords_ru on public.coffee_products using gin (seo_keywords_ru);
  end if;
end $$;


