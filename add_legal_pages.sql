-- Create legal_pages table for Delivery, Terms, and Returns pages
CREATE TABLE IF NOT EXISTS legal_pages (
  id SERIAL PRIMARY KEY,
  page_type TEXT NOT NULL UNIQUE CHECK (page_type IN ('delivery', 'terms', 'returns')),
  title_ua TEXT,
  title_ru TEXT,
  content_ua TEXT,
  content_ru TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_legal_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS legal_pages_updated_at ON legal_pages;

CREATE TRIGGER legal_pages_updated_at
  BEFORE UPDATE ON legal_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_pages_updated_at();

-- Insert default values
INSERT INTO legal_pages (page_type, title_ua, title_ru, content_ua, content_ru) VALUES
  ('delivery', 'Доставка та оплата', 'Доставка и оплата', '', ''),
  ('terms', 'Умови використання сайту', 'Условия использования сайтом', '', ''),
  ('returns', 'Політика повернення', 'Политика возврата', '', '')
ON CONFLICT (page_type) DO NOTHING;

