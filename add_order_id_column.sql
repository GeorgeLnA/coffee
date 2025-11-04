-- Add order_id column to orders table for LiqPay order tracking

begin;

-- Add order_id column if it doesn't exist
alter table public.orders 
  add column if not exists order_id text;

-- Create index for faster lookups
create index if not exists idx_orders_order_id on public.orders(order_id);

-- Update existing orders to extract order_id from notes if possible
update public.orders 
set order_id = substring(notes from 'Order ID: ([^|]+)')
where notes like '%Order ID:%' and order_id is null;

commit;

