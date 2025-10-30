import { Facebook, Instagram, Mail, Phone, ArrowRight, Coffee, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useFooterSettings } from "../hooks/use-supabase";

export default function Footer() {
  const { t, language } = useLanguage();
  const { data: settings } = useFooterSettings();
  const pick = (ua?: string | null, ru?: string | null, fallback: string = "") => (language === 'ru' ? (ru ?? ua ?? fallback) : (ua ?? ru ?? fallback));

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
      <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Logo & Brand - Clean */}
            <div className="md:col-span-1">
              <div className="mb-8">
                <img 
                  src="/manifest-site-logo.png" 
                  alt="THE COFFEE Manifest" 
                  className="h-16 w-auto mb-6"
                />
                <p className="text-white/80 font-medium leading-relaxed">
                  {pick(settings?.description_ua, settings?.description_ru, t('footer.description'))}
                </p>
              </div>
              
              {/* Social & Messengers */}
              <div className="space-y-3">
                {/* Socials */}
                <div className="flex space-x-4">
                  {settings?.show_facebook !== false && (
                    <a href={settings?.facebook_url || '#'} className="group w-12 h-12 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300" aria-label="Facebook">
                      <Facebook className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {settings?.show_instagram !== false && (
                    <a href={settings?.instagram_url || '#'} className="group w-12 h-12 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300" aria-label="Instagram">
                      <Instagram className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                </div>
                {/* Messengers */}
                <div className="flex space-x-4">
                  {settings?.show_telegram !== false && (
                    <a href={settings?.telegram_url || '#'} className="group w-12 h-12 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300" aria-label="Telegram">
                      <Send className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {settings?.show_viber !== false && (
                    <a href={settings?.viber_url || '#'} className="group w-12 h-12 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300" aria-label="Viber">
                      <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2M8.53 7.33c.16 0 .3.06.43.18c.14.14.35.52.37.56c.02.04.04.09.04.14c0 .12-.1.23-.21.34c-.10.10-.2.21-.29.3c-.09.09-.2.19-.06.37c.14.17.64 1.07 1.39 1.73c.96.85 1.78 1.11 2.03 1.23c.25.12.39.10.54-.06c.15-.16.66-.77.83-.98c.17-.21.35-.17.59-.11c.24.06 1.52.72 1.78.85c.26.13.43.19.49.30c.06.11.06.64-.14 1.25c-.20.61-1.03 1.19-1.56 1.19c-.53 0-1.31.09-1.31.09c-.53 0-1.57-.21-2.89-.82c-1.32-.61-2.28-1.81-2.35-1.89c-.07-.08-.57-.76-.57-1.45c0-.69.36-1.02.49-1.16c.13-.14.29-.17.38-.17z"/>
                      </svg>
                    </a>
                  )}
                  {settings?.show_whatsapp !== false && (
                    <a href={settings?.whatsapp_url || '#'} className="group w-12 h-12 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300" aria-label="WhatsApp">
                      <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links - Clean */}
            <div className="md:col-span-1">
              <h4 className="text-xl font-black mb-8" style={{ color: '#fcf4e4' }}>
                {pick(settings?.quick_links_title_ua, settings?.quick_links_title_ru, t('footer.quickLinks'))}
              </h4>
              <nav className="space-y-4">
                <Link to="/coffee" className="group flex items-center text-white font-medium hover:text-white/80 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  {t('nav.coffee')}
                </Link>
                <Link to="/water" className="group flex items-center text-white font-medium hover:text-white/80 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  {t('nav.water')}
                </Link>
                <Link to="/office" className="group flex items-center text-white font-medium hover:text-white/80 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  {t('nav.office')}
                </Link>
                <Link to="/news" className="group flex items-center text-white font-medium hover:text-white/80 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  {t('nav.news')}
                </Link>
                <Link to="/contact" className="group flex items-center text-white font-medium hover:text-white/80 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  {t('nav.contacts')}
                </Link>
                <Link to="/delivery" className="group flex items-center text-white font-medium hover:text-white/80 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  {language === 'ru' ? 'Доставка и оплата' : 'Доставка та оплата'}
                </Link>
                <Link to="/terms" className="group flex items-center text-white font-medium hover:text-white/80 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  {language === 'ru' ? 'Условия использования' : 'Умови використання'}
                </Link>
                <Link to="/returns" className="group flex items-center text-white font-medium hover:text-white/80 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  {language === 'ru' ? 'Политика возврата' : 'Політика повернення'}
                </Link>
              </nav>
            </div>

            {/* Contact Info - Clean */}
            <div className="md:col-span-1">
              <h4 className="text-xl font-black mb-8" style={{ color: '#fcf4e4' }}>
                {pick(settings?.contact_title_ua, settings?.contact_title_ru, t('footer.contactUs'))}
              </h4>
              <div className="space-y-6">
                {settings?.show_phone !== false && (
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <a href={`tel:${(settings?.phone_number || '0670002418').replace(/\s+/g, '')}`} className="text-white font-bold text-lg hover:underline">
                        {settings?.phone_number || '067 000 24 18'}
                      </a>
                      <p className="text-white/60 text-sm">
                        {pick(settings?.phone_desc_ua, settings?.phone_desc_ru, t('footer.callAnytime'))}
                      </p>
                    </div>
                  </div>
                )}
                
                {settings?.show_email !== false && (
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <a href={`mailto:${settings?.email_address || 'info@coffeemanifest.com'}`} className="text-white font-bold text-lg break-all hover:underline">
                        {settings?.email_address || 'info@coffeemanifest.com'}
                      </a>
                      <p className="text-white/60 text-sm">
                        {pick(settings?.email_desc_ua, settings?.email_desc_ru, t('footer.generalQuestions'))}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Clean */}
        <div className="border-t border-white/20 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left gap-4">
            <p className="text-white/60 font-bold text-sm md:text-base">
              {pick(settings?.copyright_text_ua, settings?.copyright_text_ru, `© 2025 THE COFFEE MANIFEST. ${t('footer.rightsReserved')}.`)}
            </p>
            {settings?.made_by_text && (
              <a
                href={settings?.made_by_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white underline-offset-4 hover:underline font-semibold text-sm md:text-base md:ml-auto"
              >
                {settings.made_by_text}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
