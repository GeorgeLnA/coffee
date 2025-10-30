-- Create delivery_settings table
CREATE TABLE IF NOT EXISTS delivery_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  
  -- Courier delivery price
  courier_price NUMERIC(10,2) DEFAULT 200.00,
  
  -- Free delivery threshold
  free_delivery_threshold NUMERIC(10,2) DEFAULT 1500.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_delivery_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS delivery_settings_updated_at ON delivery_settings;

CREATE TRIGGER delivery_settings_updated_at
  BEFORE UPDATE ON delivery_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_settings_updated_at();

-- Insert default values
INSERT INTO delivery_settings (id, courier_price, free_delivery_threshold) 
VALUES (1, 200.00, 1500.00)
ON CONFLICT (id) DO NOTHING;

