-- Reset orders to start from 1
-- This preserves order #34 and renumbers it to #1
-- The next order created will be #2, etc.

begin;

-- Step 1: Backup order items from order #34
CREATE TEMP TABLE temp_order_items AS
SELECT 
    product_id,
    product_name,
    product_image,
    quantity,
    price,
    variant,
    created_at
FROM public.order_items
WHERE order_id = 34;

-- Step 2: Delete all existing orders (this will cascade delete order_items)
DELETE FROM public.orders;

-- Step 3: Insert the preserved order with explicit id=1
INSERT INTO public.orders (
    id,
    created_at,
    updated_at,
    status,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    total_price,
    currency,
    notes,
    order_id,
    shipping_city,
    shipping_city_ref,
    shipping_street_address,
    shipping_warehouse_ref,
    shipping_department,
    shipping_method,
    payment_method
) VALUES (
    1,                                                      -- id (explicitly set to 1)
    '2024-11-04 10:08:15+00'::timestamptz,                 -- created_at
    '2024-11-04 10:08:15+00'::timestamptz,                 -- updated_at
    'done',                                                 -- status (changed from 'completed' to match pipeline)
    'Панасюк Анастасія Євгенівна',                         -- customer_name
    'anastaziandra@gmail.com',                              -- customer_email
    '0954133149',                                           -- customer_phone
    'м. Київ, Київська обл. (Відділення)',                 -- shipping_address
    2100.00,                                                -- total_price
    'UAH',                                                  -- currency
    NULL,                                                   -- notes
    'cm-1762250879979-va392znu',                           -- order_id
    NULL,                                                   -- shipping_city
    NULL,                                                   -- shipping_city_ref
    NULL,                                                   -- shipping_street_address
    NULL,                                                   -- shipping_warehouse_ref
    NULL,                                                   -- shipping_department
    NULL,                                                   -- shipping_method
    NULL                                                    -- payment_method
);

-- Step 4: Restore order items with new order_id=1
INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    quantity,
    price,
    variant,
    created_at
)
SELECT 
    1,              -- new order_id
    product_id,
    product_name,
    product_image,
    quantity,
    price,
    variant,
    created_at
FROM temp_order_items;

-- Step 5: Reset the sequence to 1 (with is_called=true so next will be 2)
DO $$
DECLARE
    seq_name text;
BEGIN
    -- Get the sequence name for orders.id
    SELECT pg_get_serial_sequence('public.orders', 'id') INTO seq_name;
    
    IF seq_name IS NOT NULL THEN
        -- Set sequence to 1 with is_called=true so next value will be 2
        EXECUTE format('SELECT setval(%L, 1, true)', seq_name);
        RAISE NOTICE 'Sequence % reset to 1 (next value will be 2)', seq_name;
    ELSE
        RAISE EXCEPTION 'Could not find sequence for orders.id';
    END IF;
END $$;

-- Clean up temp table
DROP TABLE IF EXISTS temp_order_items;

commit;

