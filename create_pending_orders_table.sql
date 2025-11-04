-- Create pending_orders table to temporarily store order data before payment confirmation

begin;

-- Create pending_orders table
create table if not exists public.pending_orders (
  id bigserial primary key,
  created_at timestamptz default now(),
  order_id text not null unique,
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address text,
  total_price numeric(10,2) not null default 0,
  currency text default 'UAH',
  notes text,
  order_data jsonb not null, -- Store full order data as JSON
  expires_at timestamptz default (now() + interval '24 hours') -- Auto-cleanup after 24 hours
);

-- Create index for faster lookups
create index if not exists idx_pending_orders_order_id on public.pending_orders(order_id);
create index if not exists idx_pending_orders_expires_at on public.pending_orders(expires_at);

-- Enable RLS (Row Level Security)
alter table public.pending_orders enable row level security;

-- Create policy to allow all operations
create policy "Allow all operations on pending_orders" on public.pending_orders
  for all using (true) with check (true);

commit;

