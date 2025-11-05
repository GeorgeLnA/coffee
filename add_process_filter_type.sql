-- Add 'process' as a valid filter_type for processing methods
-- This allows storing processing method translations (washed, natural, honey, semi-washed)

begin;

-- Update the check constraint to include 'process'
ALTER TABLE public.filter_options DROP CONSTRAINT IF EXISTS filter_options_filter_type_check;
ALTER TABLE public.filter_options ADD CONSTRAINT filter_options_filter_type_check 
  CHECK (filter_type IN ('origin', 'roast', 'process'));

-- Insert default processing methods with UA and RU translations
INSERT INTO public.filter_options (filter_type, value, value_ru, sort, active) VALUES
('process', 'Вмита', 'Мытая', 1, true),
('process', 'Натуральна', 'Натуральная', 2, true),
('process', 'Медова', 'Медовая', 3, true),
('process', 'Напіввмита', 'Полумытая', 4, true)
ON CONFLICT (filter_type, value) DO NOTHING;

commit;

