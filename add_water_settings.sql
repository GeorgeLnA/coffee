-- Water page settings table

CREATE TABLE IF NOT EXISTS water_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  
  -- Why Our Water Section
  why_title_ua TEXT,
  why_title_ru TEXT,
  why_desc_ua TEXT,
  why_desc_ru TEXT,
  
  -- Benefits
  benefit_natural_title_ua TEXT,
  benefit_natural_title_ru TEXT,
  benefit_natural_desc_ua TEXT,
  benefit_natural_desc_ru TEXT,
  
  benefit_tested_title_ua TEXT,
  benefit_tested_title_ru TEXT,
  benefit_tested_desc_ua TEXT,
  benefit_tested_desc_ru TEXT,
  
  benefit_quality_title_ua TEXT,
  benefit_quality_title_ru TEXT,
  benefit_quality_desc_ua TEXT,
  benefit_quality_desc_ru TEXT,
  
  -- CTA Section
  cta_title_ua TEXT,
  cta_title_ru TEXT,
  cta_desc_ua TEXT,
  cta_desc_ru TEXT,
  cta_view_coffee_ua TEXT,
  cta_view_coffee_ru TEXT,
  cta_contact_ua TEXT,
  cta_contact_ru TEXT,
  
  -- PDF Download
  test_pdf_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_water_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS water_settings_updated_at ON water_settings;

CREATE TRIGGER water_settings_updated_at
  BEFORE UPDATE ON water_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_water_settings_updated_at();

-- Insert default values
INSERT INTO water_settings (
  id,
  why_title_ua, why_title_ru,
  why_desc_ua, why_desc_ru,
  benefit_natural_title_ua, benefit_natural_title_ru,
  benefit_natural_desc_ua, benefit_natural_desc_ru,
  benefit_tested_title_ua, benefit_tested_title_ru,
  benefit_tested_desc_ua, benefit_tested_desc_ru,
  benefit_quality_title_ua, benefit_quality_title_ru,
  benefit_quality_desc_ua, benefit_quality_desc_ru,
  cta_title_ua, cta_title_ru,
  cta_desc_ua, cta_desc_ru,
  cta_view_coffee_ua, cta_view_coffee_ru,
  cta_contact_ua, cta_contact_ru,
  test_pdf_url
) VALUES (
  1,
  'Чому наша вода?', 'Почему наша вода?',
  'Ми пропонуємо тільки найкращу якість для ваших потреб', 'Мы предлагаем только лучшее качество для ваших потребностей',
  '100% Природна', '100% Природная',
  'Вода з природних джерел без хімічної обробки', 'Вода из природных источников без химической обработки',
  'Перевірена', 'Проверенная',
  'Регулярні лабораторні тести на чистоту та якість', 'Регулярные лабораторные тесты на чистоту и качество',
  'Висока Якість', 'Высокое Качество',
  'Відповідає всім стандартам якості та безпеки', 'Соответствует всем стандартам качества и безопасности',
  'Готові замовити?', 'Готовы заказать?',
  'Зв\'яжіться з нами для замовлення преміум води', 'Свяжитесь с нами для заказа премиум воды',
  'Переглянути каву', 'Посмотреть кофе',
  'Зв\'язатися з нами', 'Связаться с нами',
  '/water-tests-proof.pdf'
) ON CONFLICT (id) DO NOTHING;

