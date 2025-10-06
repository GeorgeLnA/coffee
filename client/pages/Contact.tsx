import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";
import { useLanguage } from "../contexts/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: t('contact.phone'),
      details: ["+380 50 123 45 67", "+380 44 123 45 67"],
      description: t('contact.phoneDesc')
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: t('contact.email'),
      details: ["info@coffeemanifest.com", "orders@coffeemanifest.com"],
      description: t('contact.emailDesc')
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: t('contact.hours'),
      details: [t('contact.hoursDetails')],
      description: t('contact.hoursDesc')
    }
  ];

  const tradingPoints = [
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

  return (
    <div className="min-h-screen bg-coffee-background">
      {/* Header */}
      <Header />


      {/* Contact Information */}
      <section className="pt-40 pb-20 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-6" style={{ color: '#361c0c' }}>
              {t('contact.title')}
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
              {t('contact.tradingPoints')}
            </h2>
            <p className="text-xl font-medium max-w-2xl mx-auto" style={{ color: '#fcf4e4' }}>
              {t('contact.tradingPointsDesc')}
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

      {/* Contact Form */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-6" style={{ color: '#361c0c' }}>
              {t('contact.writeUs')}
            </h2>
            <p className="text-lg font-medium max-w-2xl mx-auto" style={{ color: '#361c0c' }}>
              {t('contact.writeUsDesc')}
            </p>
          </div>

          <div className="group relative overflow-hidden shadow-2xl" style={{ backgroundColor: '#361c0c' }}>
            <div className="p-8 lg:p-12">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black mb-2" style={{ color: '#fcf4e4' }}>
                      {t('contact.name')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-[#fcf4e4] rounded-lg focus:outline-none focus:border-[#fcf4e4] text-lg"
                      style={{ backgroundColor: '#fcf4e4', color: '#361c0c' }}
                      placeholder={t('contact.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black mb-2" style={{ color: '#fcf4e4' }}>
                      {t('contact.phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border-2 border-[#fcf4e4] rounded-lg focus:outline-none focus:border-[#fcf4e4] text-lg"
                      style={{ backgroundColor: '#fcf4e4', color: '#361c0c' }}
                      placeholder={t('contact.phonePlaceholder')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-black mb-2" style={{ color: '#fcf4e4' }}>
                    {t('contact.emailLabel')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-[#fcf4e4] rounded-lg focus:outline-none focus:border-[#fcf4e4] text-lg"
                    style={{ backgroundColor: '#fcf4e4', color: '#361c0c' }}
                    placeholder={t('contact.emailPlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-black mb-2" style={{ color: '#fcf4e4' }}>
                    {t('contact.message')}
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-[#fcf4e4] rounded-lg focus:outline-none focus:border-[#fcf4e4] text-lg resize-none"
                    style={{ backgroundColor: '#fcf4e4', color: '#361c0c' }}
                    placeholder={t('contact.messagePlaceholder')}
                  />
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300 group/btn"
                    style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}
                  >
                    <span className="flex items-center justify-center space-x-3">
                      <span className="group-hover/btn:text-[#361c0c]">{t('contact.sendMessage')}</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform group-hover/btn:text-[#361c0c]" />
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <Footer />

      {/* Floating Contact Widget */}
      <FloatingContact />
    </div>
  );
}
