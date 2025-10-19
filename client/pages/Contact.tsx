import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { useContactPoints, useContactSettings } from "../hooks/use-supabase";

export default function Contact() {
  const { t, language } = useLanguage();
  const { data: settings } = useContactSettings();
  const { data: points } = useContactPoints();
  const pick = (ua?: string | null, ru?: string | null, fallback: string = "") => (language === 'ru' ? (ru ?? ua ?? fallback) : (ua ?? ru ?? fallback));

  const contactInfo = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: pick(settings?.phone_title_ua, settings?.phone_title_ru, t('contact.phone')),
      details: [settings?.phone1 || "+380 50 123 45 67", settings?.phone2 || "+380 44 123 45 67"],
      description: pick(settings?.phone_desc_ua, settings?.phone_desc_ru, t('contact.phoneDesc'))
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: pick(settings?.email_title_ua, settings?.email_title_ru, t('contact.email')),
      details: [settings?.email1 || "info@coffeemanifest.com", settings?.email2 || "orders@coffeemanifest.com"],
      description: pick(settings?.email_desc_ua, settings?.email_desc_ru, t('contact.emailDesc'))
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: pick(settings?.hours_title_ua, settings?.hours_title_ru, t('contact.hours')),
      details: [pick(settings?.hours_details_ua, settings?.hours_details_ru, t('contact.hoursDetails'))],
      description: pick(settings?.hours_desc_ua, settings?.hours_desc_ru, t('contact.hoursDesc'))
    }
  ];

  const tradingPoints = (points && points.length
    ? points.map((p) => ({
        name: pick(p.name_ua, p.name_ru, ''),
        address: p.address || '',
        hours: pick(p.hours_ua, p.hours_ru, ''),
      }))
    : [
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
      ]);

  return (
    <div className="min-h-screen bg-coffee-background">
      {/* Header */}
      <Header />


      {/* Contact Information */}
      <section className="pt-40 pb-20 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-6" style={{ color: '#361c0c' }}>
              {pick(settings?.title_ua, settings?.title_ru, t('contact.title'))}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                    <p key={idx} className="text-lg font-medium" style={{ color: '#361c0c' }}>
                      {detail}
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

      {/* Trading Points */}
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
            {tradingPoints.map((point, index) => (
              <div key={index} className="group relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500" style={{ backgroundColor: '#fcf4e4' }}>
                <div className="p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-black" style={{ color: '#361c0c' }}>
                      {point.name}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5" style={{ color: '#361c0c' }} />
                      <span className="font-medium" style={{ color: '#361c0c' }}>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
