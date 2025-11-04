SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN (
    'shipping_city',
    'shipping_city_ref',
    'shipping_street_address',
    'shipping_warehouse_ref',
    'shipping_department',
    'shipping_method',
    'payment_method',
    'order_id'
  )
ORDER BY column_name;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'order_items'
  AND column_name = 'variant';
