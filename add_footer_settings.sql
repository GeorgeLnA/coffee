-- Create footer_settings table
CREATE TABLE IF NOT EXISTS footer_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  
  -- Brand section
  description_ua TEXT,
  description_ru TEXT,
  
  -- Social links
  facebook_url TEXT,
  instagram_url TEXT,
  telegram_url TEXT,
  viber_url TEXT,
  whatsapp_url TEXT,
  
  -- Social visibility toggles
  show_facebook BOOLEAN DEFAULT true,
  show_instagram BOOLEAN DEFAULT true,
  show_telegram BOOLEAN DEFAULT true,
  show_viber BOOLEAN DEFAULT true,
  show_whatsapp BOOLEAN DEFAULT true,
  
  -- Quick links section
  quick_links_title_ua TEXT,
  quick_links_title_ru TEXT,
  
  -- Contact section
  contact_title_ua TEXT,
  contact_title_ru TEXT,
  phone_label_ua TEXT,
  phone_label_ru TEXT,
  phone_number TEXT,
  phone_desc_ua TEXT,
  phone_desc_ru TEXT,
  email_label_ua TEXT,
  email_label_ru TEXT,
  email_address TEXT,
  email_desc_ua TEXT,
  email_desc_ru TEXT,
  address_label_ua TEXT,
  address_label_ru TEXT,
  address_text_ua TEXT,
  address_text_ru TEXT,
  address_desc_ua TEXT,
  address_desc_ru TEXT,
  
  -- Contact visibility toggles
  show_phone BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT true,
  show_address BOOLEAN DEFAULT true,
  
  -- Bottom bar
  copyright_text_ua TEXT,
  copyright_text_ru TEXT,
  made_by_text TEXT,
  made_by_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_footer_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS footer_settings_updated_at ON footer_settings;

CREATE TRIGGER footer_settings_updated_at
  BEFORE UPDATE ON footer_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_footer_settings_updated_at();

-- Add WhatsApp columns if they don't exist
ALTER TABLE footer_settings 
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN DEFAULT true;

-- Insert default values
INSERT INTO footer_settings (
  id,
  description_ua,
  description_ru,
  facebook_url,
  instagram_url,
  telegram_url,
  viber_url,
  whatsapp_url,
  show_facebook,
  show_instagram,
  show_telegram,
  show_viber,
  show_whatsapp,
  quick_links_title_ua,
  quick_links_title_ru,
  contact_title_ua,
  contact_title_ru,
  phone_label_ua,
  phone_label_ru,
  phone_number,
  phone_desc_ua,
  phone_desc_ru,
  email_label_ua,
  email_label_ru,
  email_address,
  email_desc_ua,
  email_desc_ru,
  show_phone,
  show_email,
  show_address,
  copyright_text_ua,
  copyright_text_ru,
  made_by_text,
  made_by_url
) VALUES (
  1,
  '',
  '',
  '#',
  '#',
  '#',
  '#',
  '#',
  true,
  true,
  true,
  true,
  true,
  'Швидкі посилання',
  'Быстрые ссылки',
  'Зв''яжіться з нами',
  'Свяжитесь с нами',
  'Телефон',
  'Телефон',
  '067 000 24 18',
  'Дзвоніть будь-коли',
  'Звоните в любое время',
  'Email',
  'Email',
  'info@coffeemanifest.com',
  'Загальні питання',
  'Общие вопросы',
  true,
  true,
  false,
  '© 2025 THE COFFEE MANIFEST. Усі права захищені.',
  '© 2025 THE COFFEE MANIFEST. Все права защищены.',
  'Site Credit - Lead and Allure',
  'https://leadandallure.com'
)
ON CONFLICT (id) DO NOTHING;

-- Update existing records with default values where fields are NULL
UPDATE footer_settings SET
  description_ua = COALESCE(description_ua, ''),
  description_ru = COALESCE(description_ru, ''),
  facebook_url = COALESCE(facebook_url, '#'),
  instagram_url = COALESCE(instagram_url, '#'),
  telegram_url = COALESCE(telegram_url, '#'),
  viber_url = COALESCE(viber_url, '#'),
  whatsapp_url = COALESCE(whatsapp_url, '#'),
  show_facebook = COALESCE(show_facebook, true),
  show_instagram = COALESCE(show_instagram, true),
  show_telegram = COALESCE(show_telegram, true),
  show_viber = COALESCE(show_viber, true),
  show_whatsapp = COALESCE(show_whatsapp, true),
  quick_links_title_ua = COALESCE(quick_links_title_ua, 'Швидкі посилання'),
  quick_links_title_ru = COALESCE(quick_links_title_ru, 'Быстрые ссылки'),
  contact_title_ua = COALESCE(contact_title_ua, 'Зв''яжіться з нами'),
  contact_title_ru = COALESCE(contact_title_ru, 'Свяжитесь с нами'),
  phone_label_ua = COALESCE(phone_label_ua, 'Телефон'),
  phone_label_ru = COALESCE(phone_label_ru, 'Телефон'),
  phone_number = COALESCE(phone_number, '067 000 24 18'),
  phone_desc_ua = COALESCE(phone_desc_ua, 'Дзвоніть будь-коли'),
  phone_desc_ru = COALESCE(phone_desc_ru, 'Звоните в любое время'),
  email_label_ua = COALESCE(email_label_ua, 'Email'),
  email_label_ru = COALESCE(email_label_ru, 'Email'),
  email_address = COALESCE(email_address, 'info@coffeemanifest.com'),
  email_desc_ua = COALESCE(email_desc_ua, 'Загальні питання'),
  email_desc_ru = COALESCE(email_desc_ru, 'Общие вопросы'),
  show_phone = COALESCE(show_phone, true),
  show_email = COALESCE(show_email, true),
  show_address = COALESCE(show_address, false),
  copyright_text_ua = COALESCE(copyright_text_ua, '© 2025 THE COFFEE MANIFEST. Усі права захищені.'),
  copyright_text_ru = COALESCE(copyright_text_ru, '© 2025 THE COFFEE MANIFEST. Все права защищены.'),
  made_by_text = COALESCE(made_by_text, 'Site Credit - Lead and Allure'),
  made_by_url = COALESCE(made_by_url, 'https://leadandallure.com')
WHERE id = 1;

