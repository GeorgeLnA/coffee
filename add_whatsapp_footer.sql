-- Add WhatsApp support to footer_settings table
ALTER TABLE footer_settings 
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN DEFAULT true;


