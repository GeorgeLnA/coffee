-- Get order items for order #34 before resetting
-- Run this FIRST to see what items need to be preserved

SELECT 
    id,
    order_id,
    product_id,
    product_name,
    product_image,
    quantity,
    price,
    variant,
    created_at
FROM public.order_items
WHERE order_id = 34
ORDER BY id;

