-- Create admin_settings table for storing admin password and other settings

begin;

-- Create admin_settings table
create table if not exists public.admin_settings (
  id bigserial primary key,
  key text not null unique,
  value text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index on key for faster lookups
create index if not exists idx_admin_settings_key on public.admin_settings(key);

-- Enable RLS (Row Level Security)
alter table public.admin_settings enable row level security;

-- Create policy to allow all operations (admin panel only)
create policy "Allow all operations on admin_settings" on public.admin_settings
  for all using (true) with check (true);

-- Insert default admin password (can be changed later through admin panel)
insert into public.admin_settings (key, value)
values ('admin_password', 'mcroaster')
on conflict (key) do nothing;

commit;

