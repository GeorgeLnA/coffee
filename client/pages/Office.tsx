import { Phone, Mail, ArrowRight, Percent, Building2, Coffee, Droplet, CupSoda, Shield, Clock, Truck } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";
import { useLanguage } from "../contexts/LanguageContext";

export default function Office() {
  const { t } = useLanguage();

  const supplies = [
    {
      icon: <Coffee className="w-8 h-8" />,
      title: t('office.supply.coffee.title'),
      desc: t('office.supply.coffee.desc'),
      points: [
        t('office.supply.coffee.point1'),
        t('office.supply.coffee.point2'),
        t('office.supply.coffee.point3')
      ]
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: t('office.supply.machines.title'),
      desc: t('office.supply.machines.desc'),
      points: [
        t('office.supply.machines.point1'),
        t('office.supply.machines.point2'),
        t('office.supply.machines.point3')
      ]
    },
    {
      icon: <Droplet className="w-8 h-8" />,
      title: t('office.supply.water.title'),
      desc: t('office.supply.water.desc'),
      points: [
        t('office.supply.water.point1'),
        t('office.supply.water.point2')
      ]
    },
    {
      icon: <CupSoda className="w-8 h-8" />,
      title: t('office.supply.cups.title'),
      desc: t('office.supply.cups.desc'),
      points: [
        t('office.supply.cups.point1'),
        t('office.supply.cups.point2')
      ]
    }
  ];

  const benefits = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: t('office.benefits.delivery'),
      desc: t('office.benefits.deliveryDesc')
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t('office.benefits.schedule'),
      desc: t('office.benefits.scheduleDesc')
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('office.benefits.support'),
      desc: t('office.benefits.supportDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-coffee-background">
      <Header />

      {/* Hero */}
      <section className="pt-40 pb-16 relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
            {t('office.title')}
          </h1>
          <p className="text-xl font-medium max-w-3xl mx-auto mb-10" style={{ color: '#fcf4e4' }}>
            {t('office.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="tel:+380501234567" className="group px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
              <span className="flex items-center space-x-3 group-hover:text-[#361c0c]">
                <Phone className="w-5 h-5" />
                <span>{t('office.cta.call')}</span>
              </span>
            </a>
            <a href="mailto:info@coffeemanifest.com" className="group px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
              <span className="flex items-center space-x-3 group-hover:text-[#361c0c]">
                <Mail className="w-5 h-5" />
                <span>{t('office.cta.email')}</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* What we supply */}
      <section className="py-20" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>
              {t('office.supply.title')}
            </h2>
            <p className="text-lg font-medium max-w-3xl mx-auto" style={{ color: '#361c0c' }}>
              {t('office.supply.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {supplies.map((s, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: '#361c0c' }}>
                <div className="p-8 md:p-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: '#fcf4e4' }}>
                    <div style={{ color: '#361c0c' }}>{s.icon}</div>
                  </div>
                  <h3 className="text-2xl font-black mb-4 font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                    {s.title}
                  </h3>
                  <p className="text-base font-medium leading-relaxed mb-4" style={{ color: '#fcf4e4' }}>
                    {s.desc}
                  </p>
                  <div className="h-px my-4" style={{ backgroundColor: '#fcf4e4' + '30' }}></div>
                  <ul className="space-y-2">
                    {s.points.map((p: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded" style={{ backgroundColor: '#fcf4e4' }}></div>
                        <span className="text-sm md:text-base font-medium" style={{ color: '#fcf4e4' }}>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discounts & Benefits */}
      <section className="py-20" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Discounts */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4" style={{ backgroundColor: '#fcf4e4' + '10' }}>
                <Percent className="w-4 h-4" style={{ color: '#fcf4e4' }} />
                <span className="text-sm font-bold" style={{ color: '#fcf4e4' }}>{t('office.discounts.badge')}</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                {t('office.discounts.title')}
              </h3>
              <p className="text-lg font-medium mb-6" style={{ color: '#fcf4e4' }}>
                {t('office.discounts.desc')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { title: t('office.discounts.tier1.title'), desc: t('office.discounts.tier1.desc') },
                  { title: t('office.discounts.tier2.title'), desc: t('office.discounts.tier2.desc') },
                  { title: t('office.discounts.tier3.title'), desc: t('office.discounts.tier3.desc') },
                ].map((tier, i) => (
                  <div key={i} className="p-6 rounded-lg text-center shadow-lg" style={{ backgroundColor: '#fcf4e4' }}>
                    <div className="text-4xl font-black mb-2 font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>{tier.title}</div>
                    <div className="text-sm md:text-base font-medium" style={{ color: '#361c0c' }}>{tier.desc}</div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-xl font-black mb-3 font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>{t('office.discounts.combos.title')}</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fcf4e4' }}></div>
                    <span className="text-base font-medium" style={{ color: '#fcf4e4' }}>{t('office.discounts.combos.point1')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fcf4e4' }}></div>
                    <span className="text-base font-medium" style={{ color: '#fcf4e4' }}>{t('office.discounts.combos.point2')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-4 p-6 rounded-lg border border-white/10" style={{ backgroundColor: '#fcf4e4' + '10' }}>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full shrink-0" style={{ backgroundColor: '#fcf4e4' }}>
                    <div style={{ color: '#361c0c' }}>{b.icon}</div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black mb-1 font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                      {b.title}
                    </h4>
                    <p className="text-sm md:text-base font-medium" style={{ color: '#fcf4e4' }}>
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-5xl font-black mb-6 font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>
            {t('office.cta.title')}
          </h3>
          <p className="text-lg font-medium mb-8" style={{ color: '#361c0c' }}>
            {t('office.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="tel:+380501234567" className="group/btn px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] transition-all duration-300" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
              <span className="flex items-center space-x-3 group-hover/btn:text-[#fcf4e4]">
                <Phone className="w-5 h-5" />
                <span>{t('office.cta.call')}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </a>
            <a href="mailto:info@coffeemanifest.com" className="group/btn px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] transition-all duration-300" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
              <span className="flex items-center space-x-3 group-hover/btn:text-[#fcf4e4]">
                <Mail className="w-5 h-5" />
                <span>{t('office.cta.email')}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingContact />
    </div>
  );
}


