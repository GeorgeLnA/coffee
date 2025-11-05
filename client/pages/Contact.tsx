import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageSections } from "@/hooks/use-supabase";
import { CustomSection } from "@/components/CustomSection";
import { useLanguage } from "../contexts/LanguageContext";
import { useContactPoints, useContactSettings } from "../hooks/use-supabase";
import { useMemo } from "react";

export default function Contact() {
  const { t, language } = useLanguage();
  const { data: settings } = useContactSettings();
  const { data: points } = useContactPoints();
  const { data: customSections } = usePageSections('contact');
  const pick = (ua?: string | null, ru?: string | null, fallback: string = "") => (language === 'ru' ? (ru ?? ua ?? fallback) : (ua ?? ru ?? fallback));

  const primaryPhone = (settings?.phone1 || "+380 67 473 88 86").replace(/\s+/g, ' ').trim();
  const primaryEmail = (settings?.email1 || "manifestcava@gmail.com").trim();

  // Format opening hours dynamically based on day and time
  const formatOpeningHours = (openDay: number | null, openHour: number, closeHour: number): string => {
    if (openDay == null) {
      return language === 'ru' ? 'График работы не указан' : 'Графік роботи не вказано';
    }

    const dayNames = language === 'ru' 
      ? ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
      : ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
    
    const dayName = dayNames[openDay] || '';
    const formatTime = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;
    
    return `${dayName}: ${formatTime(openHour)}-${formatTime(closeHour)}`;
  };

  // Only phone and email cards (removed working hours)
  const contactInfo = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: pick(settings?.phone_title_ua, settings?.phone_title_ru, t('contact.phone')),
      details: [primaryPhone],
      description: pick(settings?.phone_desc_ua, settings?.phone_desc_ru, t('contact.phoneDesc'))
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: pick(settings?.email_title_ua, settings?.email_title_ru, t('contact.email')),
      details: [primaryEmail],
      description: pick(settings?.email_desc_ua, settings?.email_desc_ru, t('contact.emailDesc'))
    }
  ];

  const tradingPoints = useMemo(() => {
    if (points && points.length) {
      return points.map((p) => {
        const openDay = p.open_day != null ? Number(p.open_day) : null;
        const openHour = p.open_hour != null ? Number(p.open_hour) : 9;
        const closeHour = p.close_hour != null ? Number(p.close_hour) : 18;
        
        // Use dynamic hours if available, otherwise fallback to static text
        const dynamicHours = (openDay != null || p.open_hour != null || p.close_hour != null)
          ? formatOpeningHours(openDay, openHour, closeHour)
          : pick(p.hours_ua, p.hours_ru, '');
        
        return {
        name: pick(p.name_ua, p.name_ru, ''),
        address: p.address || '',
          hours: dynamicHours,
        };
      });
    }
    
    return [
        {
          name: t('contact.street1'),
          address: "50°24'24.1\"N 30°38'57.4\"E",
          hours: t('contact.saturday'),
          active: true
        },
        {
          name: t('contact.street2'),
          address: "50°22'56.6\"N 30°27'32.5\"E",
          hours: t('contact.sunday'),
          active: false
        }
    ];
  }, [points, language, t]);

  const renderDetail = (detail: string) => {
    const trimmed = detail.trim();
    if (/^[+\d][\d\s()-]+$/.test(trimmed)) {
      const telHref = `tel:${trimmed.replace(/[^+\d]/g, '')}`;
      return <a href={telHref} className="underline-offset-2 hover:underline" style={{ color: '#361c0c' }}>{trimmed}</a>;
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return <a href={`mailto:${trimmed}`} className="underline-offset-2 hover:underline" style={{ color: '#361c0c' }}>{trimmed}</a>;
    }
    return <span style={{ color: '#361c0c' }}>{trimmed}</span>;
  };

  return (
    <div className="min-h-screen bg-coffee-background">
      {/* Header */}
      <Header />


      {/* Contact Information */}
      {!settings?.hide_contact_info && (
      <section className="pt-40 pb-20 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-6" style={{ color: '#361c0c' }}>
              {pick(settings?.title_ua, settings?.title_ru, t('contact.title'))}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: '#361c0c' }}>
                  <div style={{ color: '#fcf4e4' }}>
                    {info.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-4" style={{ color: '#361c0c' }}>
                  {info.title}
                </h3>
                <div className="space-y-2 mb-4">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-lg font-medium">
                      {renderDetail(detail)}
                    </p>
                  ))}
                </div>
                <p className="text-sm font-medium" style={{ color: '#361c0c' }}>
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Custom sections at 'after-contact' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-contact' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

      {/* Trading Points */}
      {!settings?.hide_trade_points && (
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-6" style={{ color: '#fcf4e4' }}>
              {pick(settings?.trading_title_ua, settings?.trading_title_ru, t('contact.tradingPoints'))}
            </h2>
            <p className="text-xl font-medium max-w-2xl mx-auto" style={{ color: '#fcf4e4' }}>
              {pick(settings?.trading_desc_ua, settings?.trading_desc_ru, t('contact.tradingPointsDesc'))}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {tradingPoints.map((point, index) => {
              const query = encodeURIComponent(point.address.trim());
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
              return (
                <a
                  key={index}
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer"
                  style={{ backgroundColor: '#fcf4e4' }}
                >
                  <div className="p-8">
                    <div className="mb-4">
                      <h3 className="text-2xl font-black" style={{ color: '#361c0c' }}>
                        {point.name}
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5" style={{ color: '#361c0c' }} />
                        <span 
                          className="font-medium" 
                          style={{ 
                            color: '#361c0c',
                            textDecoration: 'none',
                            pointerEvents: 'none',
                            userSelect: 'text',
                            WebkitUserSelect: 'text',
                            MozUserSelect: 'text',
                            msUserSelect: 'text'
                          }}
                          suppressContentEditableWarning={true}
                          contentEditable={false}
                        >
                          {point.address}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5" style={{ color: '#361c0c' }} />
                        <span className="font-medium" style={{ color: '#361c0c' }}>
                          {point.hours}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Custom sections at 'after-trade' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-trade' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

      {/* Footer */}
      <Footer />
    </div>
  );
}
