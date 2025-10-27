begin;

-- featured_products capped at 3 rows
create table if not exists public.featured_products (
  id bigserial primary key,
  sort int,
  status text default 'published',
  title_ua text not null,
  description_ua text,
  title_ru text not null,
  description_ru text,
  image_url text,
  hover_image_url text,
  link_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.featured_products disable row level security;

create extension if not exists moddatetime with schema extensions;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ensure max 3 rows
create or replace function public.enforce_featured_products_limit()
returns trigger language plpgsql as $$
declare cnt int;
begin
  select count(*) into cnt from public.featured_products;
  if (TG_OP = 'INSERT') then
    if cnt >= 3 then
      raise exception 'Max 3 featured slides allowed';
    end if;
  end if;
  return NEW;
end $$;

-- recreate triggers
drop trigger if exists trg_featured_products_touch on public.featured_products;
create trigger trg_featured_products_touch
before update on public.featured_products
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_featured_products_limit on public.featured_products;
create trigger trg_featured_products_limit
before insert on public.featured_products
for each row execute procedure public.enforce_featured_products_limit();

-- optional: keep sort unique among rows
create unique index if not exists idx_featured_products_sort_unique on public.featured_products(sort) where sort is not null;

commit;

-- Seed exactly three featured slides (reset to these 3)
begin;
delete from public.featured_products;
insert into public.featured_products (sort, status, title_ua, title_ru, description_ua, description_ru, image_url, hover_image_url, link_url) values
  (1, 'published', 'COLOMBIA SUPREMO', 'COLOMBIA SUPREMO', null, 'Премиум кофейные зерна с нотами сливы и шоколада', '/250-g_Original.PNG', '/woocommerce-placeholder_Original.PNG', '/coffee'),
  (2, 'published', 'ETHIOPIA GUJI', 'ETHIOPIA GUJI', null, 'Органический кофе с нотами черной смородины', '/250-g_Original.PNG', '/woocommerce-placeholder_Original.PNG', '/coffee'),
  (3, 'published', 'BRAZIL SANTOS', 'BRAZIL SANTOS', null, 'Классический бразильский кофе с мягким вкусом', '/250-g_Original.PNG', '/woocommerce-placeholder_Original.PNG', '/coffee');
commit;

-- Coffee products schema
begin;

create table if not exists public.coffee_products (
  id bigserial primary key,
  slug text unique,
  name_ua text not null,
  name_ru text not null,
  description_ua text,
  description_ru text,
  image_url text,
  origin text,
  roast text, -- light | medium | dark
  in_stock boolean default true,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.coffee_sizes (
  id bigserial primary key,
  product_id bigint not null references public.coffee_products(id) on delete cascade,
  sort int,
  enabled boolean default true,
  label_ua text,
  label_ru text,
  weight int, -- grams
  price numeric(12,2), -- UAH
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.coffee_products disable row level security;
alter table public.coffee_sizes disable row level security;

create extension if not exists moddatetime with schema extensions;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_coffee_products_touch on public.coffee_products;
create trigger trg_coffee_products_touch before update on public.coffee_products for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_coffee_sizes_touch on public.coffee_sizes;
create trigger trg_coffee_sizes_touch before update on public.coffee_sizes for each row execute procedure public.touch_updated_at();

create index if not exists idx_coffee_sizes_product_id on public.coffee_sizes(product_id);
create index if not exists idx_coffee_sizes_sort on public.coffee_sizes(product_id, sort);

commit;

-- Extra constraints and policies
begin;

-- Roast constraint (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coffee_roast_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products
      add constraint coffee_roast_check
      check (roast is null or roast in ('light','medium','dark'));
  end if;
end $$;

-- Unique size label per product (UA and RU separately)
create unique index if not exists idx_coffee_sizes_label_ua_unique
  on public.coffee_sizes(product_id, label_ua) where label_ua is not null;
create unique index if not exists idx_coffee_sizes_label_ru_unique
  on public.coffee_sizes(product_id, label_ru) where label_ru is not null;

-- Ensure positive price (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coffee_sizes_price_check' and conrelid = 'public.coffee_sizes'::regclass
  ) then
    alter table public.coffee_sizes
      add constraint coffee_sizes_price_check check (price is null or price >= 0);
  end if;
end $$;

-- Ensure positive weight (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'coffee_sizes_weight_check' and conrelid = 'public.coffee_sizes'::regclass
  ) then
    alter table public.coffee_sizes
      add constraint coffee_sizes_weight_check check (weight is null or weight > 0);
  end if;
end $$;

commit;

-- Storage bucket 'media' (if not exists) and public policies (skip if no privilege)
do $$
begin
  begin
    if not exists (select 1 from storage.buckets where id = 'media') then
      insert into storage.buckets (id, name, public) values ('media', 'media', true);
    end if;
  exception when others then
    raise notice 'Skipping storage bucket create: %', sqlerrm;
  end;

  begin
    execute 'alter table storage.objects enable row level security';
  exception when insufficient_privilege then
    raise notice 'Skipping alter storage.objects RLS: insufficient privilege';
  when others then
    raise notice 'Skipping alter storage.objects RLS: %', sqlerrm;
  end;

  begin
    execute 'drop policy if exists "Public read media" on storage.objects';
    execute 'create policy "Public read media" on storage.objects for select to public using (bucket_id = ''media'')';
    execute 'drop policy if exists "Anon upload media" on storage.objects';
    execute 'create policy "Anon upload media" on storage.objects for insert to anon with check (bucket_id = ''media'')';
    execute 'drop policy if exists "Anon update media" on storage.objects';
    execute 'create policy "Anon update media" on storage.objects for update to anon using (bucket_id = ''media'') with check (bucket_id = ''media'')';
    execute 'drop policy if exists "Anon delete media" on storage.objects';
    execute 'create policy "Anon delete media" on storage.objects for delete to anon using (bucket_id = ''media'')';
  exception when insufficient_privilege then
    raise notice 'Skipping storage policies: insufficient privilege';
  when others then
    raise notice 'Skipping storage policies: %', sqlerrm;
  end;
end $$;

-- Seed coffee products and sizes from current site
begin;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('colombia-supremo','Colombia Supremo','Colombia Supremo','Насичений та повнотілий з нотами шоколаду та карамелі','Насыщенный и полнотелый с нотами шоколада и карамели','/250-g_Original.PNG','Colombia','medium',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,249.90);
  else
    update public.coffee_sizes set price=249.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('ethiopia-guji-organic','Ethiopia Guji Organic','Ethiopia Guji Organic','Яскравий та квітковий з нотами цитрусових та ягід','Яркий и цветочный с нотами цитрусовых и ягод','/500_Manifestcoffee_Original.PNG','Ethiopia','light',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,149.90);
    
  else
    update public.coffee_sizes set price=149.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('brazil-santos','Brazil Santos','Brazil Santos','М''який та горіховий з низькою кислотністю','Мягкий и ореховый с низкой кислотностью','/250-g_Original.PNG','Brazil','dark',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,199.90);
  else
    update public.coffee_sizes set price=199.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('kenya-aa','Kenya AA','Kenya AA','Винна кислотність з нотами чорної смородини','Винная кислотность с нотами черной смородины','/500_Manifestcoffee_Original.PNG','Kenya','medium',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,279.90);
  else
    update public.coffee_sizes set price=279.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('guatemala-antigua','Guatemala Antigua','Guatemala Antigua','Складний з пряними та димчастими відтінками','Сложный с пряными и дымчатыми оттенками','/250-g_Original.PNG','Guatemala','medium',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,269.90);
  else
    update public.coffee_sizes set price=269.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('jamaica-blue-mountain','Jamaica Blue Mountain','Jamaica Blue Mountain','М''який та гладкий без гіркоти','Мягкий и гладкий без горечи','/500_Manifestcoffee_Original.PNG','Jamaica','medium',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,899.90);
  else
    update public.coffee_sizes set price=899.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('peru-organic','Peru Organic','Peru Organic','Чистий та яскравий з трав''яними нотами','Чистый и яркий с травяными нотами','/250-g_Original.PNG','Peru','light',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,229.90);
  else
    update public.coffee_sizes set price=229.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('costa-rica-tarrazu','Costa Rica Tarrazú','Costa Rica Tarrazú','Яскрава кислотність з медовою солодкістю','Яркая кислотность с медовой сладостью','/500_Manifestcoffee_Original.PNG','Costa Rica','medium',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,259.90);
  else
    update public.coffee_sizes set price=259.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('sumatra-mandheling','Sumatra Mandheling','Sumatra Mandheling','Повнотілий з земними та трав''яними нотами','Полнотелый с земляными и травяными нотами','/250-g_Original.PNG','Indonesia','dark',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,239.90);
  else
    update public.coffee_sizes set price=239.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

do $$ declare pid bigint; begin
  insert into public.coffee_products (slug, name_ua, name_ru, description_ua, description_ru, image_url, origin, roast, in_stock, featured, active)
  values ('hawaii-kona','Hawaii Kona','Hawaii Kona','Гладкий та м''який з тонкою солодкістю','Гладкий и мягкий с тонкой сладостью','/500_Manifestcoffee_Original.PNG','Hawaii','medium',true,false,true)
  on conflict (slug) do update set
    name_ua=excluded.name_ua, name_ru=excluded.name_ru,
    description_ua=excluded.description_ua, description_ru=excluded.description_ru,
    image_url=excluded.image_url, origin=excluded.origin, roast=excluded.roast,
    in_stock=excluded.in_stock, featured=excluded.featured, active=excluded.active
  returning id into pid;
  if not exists (select 1 from public.coffee_sizes where product_id=pid and weight=250) then
    insert into public.coffee_sizes (product_id, sort, enabled, label_ua, label_ru, weight, price)
    values (pid,1,true,'250 г','250 г',250,699.90);
  else
    update public.coffee_sizes set price=699.90, label_ua='250 г', label_ru='250 г', enabled=true where product_id=pid and weight=250;
  end if;
end $$;

commit;

-- Add metric label columns to coffee_products (idempotent)
begin;
alter table public.coffee_products
  add column if not exists metric_label_strength text,
  add column if not exists metric_label_acidity text,
  add column if not exists metric_label_roast text,
  add column if not exists metric_label_body text;
commit;

-- Add numeric metric levels (1..5)
begin;
alter table public.coffee_products
  add column if not exists strength_level int,
  add column if not exists acidity_level int,
  add column if not exists roast_level int,
  add column if not exists body_level int;

-- Ensure 1..5 range
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'coffee_strength_level_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products add constraint coffee_strength_level_check check (strength_level is null or (strength_level between 1 and 5));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'coffee_acidity_level_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products add constraint coffee_acidity_level_check check (acidity_level is null or (acidity_level between 1 and 5));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'coffee_roast_level_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products add constraint coffee_roast_level_check check (roast_level is null or (roast_level between 1 and 5));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'coffee_body_level_check' and conrelid = 'public.coffee_products'::regclass
  ) then
    alter table public.coffee_products add constraint coffee_body_level_check check (body_level is null or (body_level between 1 and 5));
  end if;
end $$;
commit;
