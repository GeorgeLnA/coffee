-- Test what the constraint actually expects

-- First, let's see what the current constraint looks like
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'coffee_label_data_check' 
AND conrelid = 'public.coffee_products'::regclass;

-- Test with minimal valid data
INSERT INTO public.coffee_products (
  name_ua, name_ru, in_stock, active,
  label_data
) VALUES (
  'Test Product', 'Test Product', true, true,
  '{"template": "classic", "size": "medium"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Test with custom template
INSERT INTO public.coffee_products (
  name_ua, name_ru, in_stock, active,
  label_data
) VALUES (
  'Test Custom', 'Test Custom', true, true,
  '{"template": "custom", "size": "medium", "customColors": {"bg": "#2F2A26", "text": "#FFFFFF", "accent": "#D3B58F"}}'::jsonb
) ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM public.coffee_products WHERE name_ua LIKE 'Test%';
