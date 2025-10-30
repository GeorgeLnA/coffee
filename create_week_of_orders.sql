-- Create a week's worth of test orders for analytics visualization
-- Simple approach: Insert orders one by one with their items

BEGIN;

-- Helper function to insert order with items
DO $$
DECLARE
  order_id_var bigint;
  day_offset integer;
  hour_offset integer;
  product_id_var text;
  product_name_var text;
  product_image_var text;
  quantity_var integer;
  price_var numeric;
  total_price_var numeric;
BEGIN
  -- Day 1 (7 days ago)
  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '7 days'), 'completed', 'Анна Іванова', 'anna@example.com', '+380 67 111 1111', 'вул. Хрещатик, 1, Київ', 850.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 2, 425.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '7 days' + INTERVAL '2 hours'), 'completed', 'Петро Коваленко', 'petro@example.com', '+380 63 222 2222', 'пр. Перемоги, 25, Київ', 1200.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 3, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '7 days' + INTERVAL '5 hours'), 'completed', 'Марія Сидорова', 'maria@example.com', '+380 50 333 3333', 'вул. Шевченка, 10, Київ', 450.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00);

  -- Day 2 (6 days ago)
  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '6 days'), 'completed', 'Олександр Мельник', 'oleksandr@example.com', '+380 67 444 4444', 'вул. Банкова, 5, Київ', 600.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 600.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency, notes) VALUES
    ((NOW() - INTERVAL '6 days' + INTERVAL '3 hours'), 'completed', 'Юлія Петренко', 'yulia@example.com', '+380 63 555 5555', 'пр. Грушевського, 20, Київ', 1650.00, 'UAH', 'Подарункова упаковка')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 2, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 2, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '6 days' + INTERVAL '7 hours'), 'completed', 'Анна Іванова', 'anna@example.com', '+380 67 111 1111', 'вул. Хрещатик, 1, Київ', 950.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '6 days' + INTERVAL '9 hours'), 'processing', 'Дмитро Ткаченко', 'dmitro@example.com', '+380 50 666 6666', 'вул. Лібідська, 15, Київ', 750.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  -- Day 3 (5 days ago)
  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '5 days'), 'completed', 'Наталія Бондаренко', 'natalia@example.com', '+380 67 777 7777', 'вул. Велика Васильківська, 30, Київ', 1100.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '5 days' + INTERVAL '4 hours'), 'completed', 'Петро Коваленко', 'petro@example.com', '+380 63 222 2222', 'пр. Перемоги, 25, Київ', 1300.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 3, 400.00),
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '5 days' + INTERVAL '6 hours'), 'completed', 'Олена Гриценко', 'olena@example.com', '+380 50 888 8888', 'вул. Дегтярівська, 50, Київ', 500.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00);

  -- Day 4 (4 days ago)
  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '4 days'), 'completed', 'Анна Іванова', 'anna@example.com', '+380 67 111 1111', 'вул. Хрещатик, 1, Київ', 800.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '4 days' + INTERVAL '2 hours'), 'pending', 'Сергій Морозов', 'sergey@example.com', '+380 63 999 9999', 'вул. Поштова, 12, Київ', 1400.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 2, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '4 days' + INTERVAL '5 hours'), 'completed', 'Юлія Петренко', 'yulia@example.com', '+380 63 555 5555', 'пр. Грушевського, 20, Київ', 900.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 2, 400.00),
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '4 days' + INTERVAL '8 hours'), 'completed', 'Олександр Мельник', 'oleksandr@example.com', '+380 67 444 4444', 'вул. Банкова, 5, Київ', 700.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00);

  -- Day 5 (3 days ago)
  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '3 days'), 'completed', 'Марія Сидорова', 'maria@example.com', '+380 50 333 3333', 'вул. Шевченка, 10, Київ', 550.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '3 days' + INTERVAL '3 hours'), 'completed', 'Дмитро Ткаченко', 'dmitro@example.com', '+380 50 666 6666', 'вул. Лібідська, 15, Київ', 1250.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 2, 400.00),
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '3 days' + INTERVAL '6 hours'), 'completed', 'Петро Коваленко', 'petro@example.com', '+380 63 222 2222', 'пр. Перемоги, 25, Київ', 1000.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 2, 400.00),
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '3 days' + INTERVAL '9 hours'), 'processing', 'Анна Іванова', 'anna@example.com', '+380 67 111 1111', 'вул. Хрещатик, 1, Київ', 1150.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 2, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  -- Day 6 (2 days ago)
  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '2 days'), 'completed', 'Наталія Бондаренко', 'natalia@example.com', '+380 67 777 7777', 'вул. Велика Васильківська, 30, Київ', 650.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '2 days' + INTERVAL '4 hours'), 'completed', 'Олена Гриценко', 'olena@example.com', '+380 50 888 8888', 'вул. Дегтярівська, 50, Київ', 1350.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 2, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '2 days' + INTERVAL '7 hours'), 'completed', 'Юлія Петренко', 'yulia@example.com', '+380 63 555 5555', 'пр. Грушевського, 20, Київ', 850.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 2, 425.00);

  -- Day 7 (yesterday)
  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '1 day'), 'completed', 'Олександр Мельник', 'oleksandr@example.com', '+380 67 444 4444', 'вул. Банкова, 5, Київ', 750.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '1 day' + INTERVAL '2 hours'), 'pending', 'Сергій Морозов', 'sergey@example.com', '+380 63 999 9999', 'вул. Поштова, 12, Київ', 1100.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '1 day' + INTERVAL '5 hours'), 'completed', 'Марія Сидорова', 'maria@example.com', '+380 50 333 3333', 'вул. Шевченка, 10, Київ', 920.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '1 day' + INTERVAL '8 hours'), 'completed', 'Анна Іванова', 'anna@example.com', '+380 67 111 1111', 'вул. Хрещатик, 1, Київ', 1050.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 2, 425.00),
    (order_id_var, '2', 'Colombia Supremo', '/colombia-supremo-coffeemanifest-250g.jpg', 1, 400.00);

  INSERT INTO orders (created_at, status, customer_name, customer_email, customer_phone, shipping_address, total_price, currency) VALUES
    ((NOW() - INTERVAL '1 day' + INTERVAL '11 hours'), 'processing', 'Дмитро Ткаченко', 'dmitro@example.com', '+380 50 666 6666', 'вул. Лібідська, 15, Київ', 680.00, 'UAH')
    RETURNING id INTO order_id_var;
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES
    (order_id_var, '1', 'Ethiopia Guji Organic', '/ethiopia-guji-organic-coffeemanifest-500g.jpg', 1, 425.00);

END $$;

COMMIT;

-- Verify the data
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as orders_count,
  SUM(total_price) as total_revenue
FROM orders 
WHERE customer_email LIKE '%@example.com'
GROUP BY DATE(created_at)
ORDER BY order_date;
