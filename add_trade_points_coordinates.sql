-- Add latitude, longitude, and opening hours fields to contact_trade_points table

begin;

-- Add lat and lng columns if they don't exist
alter table public.contact_trade_points 
  add column if not exists lat numeric(10, 7),
  add column if not exists lng numeric(10, 7),
  add column if not exists open_day integer, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  add column if not exists open_hour integer default 9, -- Opening hour (0-23)
  add column if not exists close_hour integer default 18; -- Closing hour (0-23)

-- Update existing records if needed (optional - you can set coordinates manually)
-- Update with example coordinates if null
-- update public.contact_trade_points 
--   set lat = 50.4067, lng = 30.6493 
--   where lat is null and id = 1;
-- update public.contact_trade_points 
--   set lat = 50.3824, lng = 30.4590 
--   where lat is null and id = 2;

commit;

