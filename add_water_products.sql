-- Add water products table
CREATE TABLE IF NOT EXISTS water_products (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE,
  sort INTEGER DEFAULT 0,
  name_ua TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description_ua TEXT,
  description_ru TEXT,
  image_url TEXT,
  volume TEXT, -- e.g., "5L", "20L"
  price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  popular BOOLEAN DEFAULT false,
  features_ua TEXT[], -- Array of features in Ukrainian
  features_ru TEXT[], -- Array of features in Russian
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add water sizes table (for different volumes/prices)
CREATE TABLE IF NOT EXISTS water_sizes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES water_products(id) ON DELETE CASCADE,
  sort INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  label_ua TEXT,
  label_ru TEXT,
  volume TEXT, -- e.g., "5L", "20L"
  price DECIMAL(10,2),
  image_url TEXT,
  special BOOLEAN DEFAULT false, -- for special styling like gift package
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_water_products_sort ON water_products(sort);
CREATE INDEX IF NOT EXISTS idx_water_products_active ON water_products(active);
CREATE INDEX IF NOT EXISTS idx_water_products_slug ON water_products(slug);
CREATE INDEX IF NOT EXISTS idx_water_sizes_product_id ON water_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_water_sizes_sort ON water_sizes(sort);

-- Add unique constraint for sort
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'water_products_sort_check'
  ) THEN
    ALTER TABLE water_products ADD CONSTRAINT water_products_sort_check CHECK (sort >= 0);
  END IF;
END $$;

-- Create unique index for sort to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_water_products_sort_unique ON water_products (sort) WHERE sort IS NOT NULL;

-- Insert some sample water products
INSERT INTO water_products (name_ua, name_ru, description_ua, description_ru, volume, price, popular, features_ua, features_ru) VALUES
('Вода "Кристальна" 5Л', 'Вода "Кристальная" 5Л', 'Чиста природна вода з джерел Карпат', 'Чистая природная вода из источников Карпат', '5L', 85.00, true, 
 ARRAY['Природна вода з джерел', 'Без хімічних добавок', 'Ідеальна для щоденного вживання', 'Зручна упаковка'],
 ARRAY['Природная вода из источников', 'Без химических добавок', 'Идеальна для ежедневного употребления', 'Удобная упаковка']),
('Вода "Кристальна" 20Л', 'Вода "Кристальная" 20Л', 'Велика упаковка для офісу та дому', 'Большая упаковка для офиса и дома', '20L', 250.00, false,
 ARRAY['Економна упаковка', 'Для великих сімей', 'Офісне використання', 'Довгий термін зберігання'],
 ARRAY['Экономичная упаковка', 'Для больших семей', 'Офисное использование', 'Долгий срок хранения'])
ON CONFLICT DO NOTHING;

-- Insert corresponding sizes
INSERT INTO water_sizes (product_id, volume, price, label_ua, label_ru, enabled) 
SELECT 
  wp.id,
  wp.volume,
  wp.price,
  wp.volume,
  wp.volume,
  true
FROM water_products wp
ON CONFLICT DO NOTHING;
