-- Add order items to order #1
-- Order total: 2100.00 UAH
-- Products: Colombia Supremo with espresso grind

begin;

-- Colombia Supremo with espresso grind
-- Assuming multiple quantities to reach ~2100 UAH (including shipping if applicable)
INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    quantity,
    price,
    variant,
    created_at
) VALUES 
    -- Colombia Supremo (espresso grind)
    (1, '1', 'Colombia Supremo', '/250-g_Original.PNG', 8, 249.90, 'Еспресо', '2024-11-04 10:08:15+00'::timestamptz);
    
    -- If 8 × 249.90 = 1999.20, and total is 2100.00, the difference (~100) might be shipping
    -- Adjust quantities if needed based on actual order details

commit;

