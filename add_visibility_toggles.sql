-- Visibility toggles for pages

-- Homepage toggles
alter table if exists homepage_settings
  add column if not exists hide_season boolean default false,
  add column if not exists hide_video boolean default false,
  add column if not exists hide_about boolean default false,
  add column if not exists hide_cafes boolean default false,
  add column if not exists hide_news boolean default false;

-- Office page toggles
alter table if exists office_settings
  add column if not exists hide_supply boolean default false,
  add column if not exists hide_discounts boolean default false,
  add column if not exists hide_benefits boolean default false,
  add column if not exists hide_cta boolean default false;

-- Contact page toggles
alter table if exists contact_settings
  add column if not exists hide_contact_info boolean default false,
  add column if not exists hide_trade_points boolean default false;
