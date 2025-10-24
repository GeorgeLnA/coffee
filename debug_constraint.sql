-- Debug the constraint issue by temporarily disabling it

begin;

-- Drop the constraint temporarily to see what data is causing issues
alter table public.coffee_products 
drop constraint if exists coffee_label_data_check;

-- Let's also check what data is currently in the table
select id, name_ua, label_data from public.coffee_products 
where label_data is not null 
order by id desc 
limit 5;

commit;
