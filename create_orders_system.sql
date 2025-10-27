-- Create orders and order_items tables for order tracking

begin;

-- Create orders table
create table if not exists public.orders (
  id bigserial primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text default 'pending',
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address text,
  total_price numeric(10,2) not null default 0,
  currency text default 'UAH',
  notes text
);

-- Create order_items table
create table if not exists public.order_items (
  id bigserial primary key,
  order_id bigint references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_image text,
  quantity integer not null default 1,
  price numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Create indexes for better query performance
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- Enable RLS (Row Level Security)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Create policies to allow all operations (you may want to restrict these later)
create policy "Allow all operations on orders" on public.orders
  for all using (true) with check (true);

create policy "Allow all operations on order_items" on public.order_items
  for all using (true) with check (true);

-- Insert 3 test orders with items
insert into public.orders (status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency, notes) values
  ('completed', 'Іван Коваленко', 'ivan@example.com', '+380 50 123 4567', 'вул. Хрещатик, 1, Київ', 850.00, 'UAH', 'Швидка доставка'),
  ('pending', 'Олена Петрова', 'elena@example.com', '+380 67 234 5678', 'пр. Перемоги, 10, Київ', 1200.00, 'UAH', NULL),
  ('processing', 'Дмитро Сідоров', 'dmitro@example.com', '+380 63 345 6789', 'вул. Банкова, 5, Київ', 1500.00, 'UAH', 'Потрібна подарункова упаковка');

-- Insert order items for the test orders
insert into public.order_items (order_id, product_id, product_name, product_image, quantity, price) values
  -- Order 1
  (1, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 2, 425.00),
  -- Order 2  
  (2, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 3, 400.00),
  -- Order 3
  (3, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00),
  (3, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 2, 400.00);

commit;

