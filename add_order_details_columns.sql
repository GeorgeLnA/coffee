-- Add missing columns to store all order details
-- This includes variant (grind type, size) for items and full shipping details

begin;

-- Add variant column to order_items table to store grind type, size, etc.
alter table public.order_items
  add column if not exists variant text;

-- Add detailed shipping columns to orders table
alter table public.orders
  add column if not exists shipping_city text,
  add column if not exists shipping_city_ref text,
  add column if not exists shipping_street_address text,
  add column if not exists shipping_warehouse_ref text,
  add column if not exists shipping_department text,
  add column if not exists shipping_method text,
  add column if not exists payment_method text;

-- Update existing shipping_address to use new detailed columns if possible
-- This is a one-time migration - existing orders will keep shipping_address as is

commit;

