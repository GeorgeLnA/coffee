import { Phone, Mail, ArrowRight, Percent, Building2, Coffee, Droplet, CupSoda, Shield, Clock, Truck } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageSections } from "@/hooks/use-supabase";
import { CustomSection } from "@/components/CustomSection";
import { useLanguage } from "../contexts/LanguageContext";
import { useOfficeSettings } from "../hooks/use-supabase";

export default function Office() {
  const { t, language } = useLanguage();
  const { data: office } = useOfficeSettings();
  const { data: customSections } = usePageSections('office');
  const pick = (ua?: string | null, ru?: string | null, fallback: string = "") => (language === 'ru' ? (ru ?? ua ?? fallback) : (ua ?? ru ?? fallback));

  const supplies = [
    {
      icon: <Coffee className="w-8 h-8" />,
      title: pick(office?.supply_coffee_title_ua, office?.supply_coffee_title_ru, t('office.supply.coffee.title')),
      desc: pick(office?.supply_coffee_desc_ua, office?.supply_coffee_desc_ru, t('office.supply.coffee.desc')),
      points: [
        pick(office?.supply_coffee_point1_ua, office?.supply_coffee_point1_ru, t('office.supply.coffee.point1')),
        pick(office?.supply_coffee_point2_ua, office?.supply_coffee_point2_ru, t('office.supply.coffee.point2')),
        pick(office?.supply_coffee_point3_ua, office?.supply_coffee_point3_ru, t('office.supply.coffee.point3')),
      ]
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: pick(office?.supply_machines_title_ua, office?.supply_machines_title_ru, t('office.supply.machines.title')),
      desc: pick(office?.supply_machines_desc_ua, office?.supply_machines_desc_ru, t('office.supply.machines.desc')),
      points: [
        pick(office?.supply_machines_point1_ua, office?.supply_machines_point1_ru, t('office.supply.machines.point1')),
        pick(office?.supply_machines_point2_ua, office?.supply_machines_point2_ru, t('office.supply.machines.point2')),
        pick(office?.supply_machines_point3_ua, office?.supply_machines_point3_ru, t('office.supply.machines.point3')),
      ]
    },
    {
      icon: <Droplet className="w-8 h-8" />,
      title: pick(office?.supply_water_title_ua, office?.supply_water_title_ru, t('office.supply.water.title')),
      desc: pick(office?.supply_water_desc_ua, office?.supply_water_desc_ru, t('office.supply.water.desc')),
      points: [
        pick(office?.supply_water_point1_ua, office?.supply_water_point1_ru, t('office.supply.water.point1')),
        pick(office?.supply_water_point2_ua, office?.supply_water_point2_ru, t('office.supply.water.point2')),
      ]
    },
    {
      icon: <CupSoda className="w-8 h-8" />,
      title: pick(office?.supply_cups_title_ua, office?.supply_cups_title_ru, t('office.supply.cups.title')),
      desc: pick(office?.supply_cups_desc_ua, office?.supply_cups_desc_ru, t('office.supply.cups.desc')),
      points: [
        pick(office?.supply_cups_point1_ua, office?.supply_cups_point1_ru, t('office.supply.cups.point1')),
        pick(office?.supply_cups_point2_ua, office?.supply_cups_point2_ru, t('office.supply.cups.point2')),
      ]
    }
  ];

  const benefits = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: pick(office?.benefits_delivery_title_ua, office?.benefits_delivery_title_ru, t('office.benefits.delivery')),
      desc: pick(office?.benefits_delivery_desc_ua, office?.benefits_delivery_desc_ru, t('office.benefits.deliveryDesc'))
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: pick(office?.benefits_schedule_title_ua, office?.benefits_schedule_title_ru, t('office.benefits.schedule')),
      desc: pick(office?.benefits_schedule_desc_ua, office?.benefits_schedule_desc_ru, t('office.benefits.scheduleDesc'))
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: pick(office?.benefits_support_title_ua, office?.benefits_support_title_ru, t('office.benefits.support')),
      desc: pick(office?.benefits_support_desc_ua, office?.benefits_support_desc_ru, t('office.benefits.supportDesc'))
    }
  ];

  return (
    <div className="min-h-screen bg-coffee-background">
      <Header />

      {/* Hero */}
      <section className="pt-40 pb-16 relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
            {pick(office?.hero_title_ua, office?.hero_title_ru, t('office.title'))}
          </h1>
          <p className="text-xl font-medium max-w-3xl mx-auto mb-10" style={{ color: '#fcf4e4' }}>
            {pick(office?.hero_subtitle_ua, office?.hero_subtitle_ru, t('office.subtitle'))}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={`tel:${office?.cta_phone || '+380501234567'}`} className="group px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
              <span className="flex items-center space-x-3 group-hover:text-[#361c0c]">
                <Phone className="w-5 h-5" />
                <span>{pick(office?.cta_call_text_ua, office?.cta_call_text_ru, t('office.cta.call'))}</span>
              </span>
            </a>
            <a href={`mailto:${office?.cta_email || 'info@coffeemanifest.com'}`} className="group px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
              <span className="flex items-center space-x-3 group-hover:text-[#361c0c]">
                <Mail className="w-5 h-5" />
                <span>{pick(office?.cta_email_text_ua, office?.cta_email_text_ru, t('office.cta.email'))}</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Custom sections at 'after-hero' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-hero' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

      {/* What we supply */}
      {!office?.hide_supply && (
      <section className="py-20" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>
              {pick(office?.supply_title_ua, office?.supply_title_ru, t('office.supply.title'))}
            </h2>
            <p className="text-lg font-medium max-w-3xl mx-auto" style={{ color: '#361c0c' }}>
              {pick(office?.supply_subtitle_ua, office?.supply_subtitle_ru, t('office.supply.subtitle'))}
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
      )}

      {/* Custom sections at 'after-supply' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-supply' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

      {/* Discounts & Benefits */}
      {!(office?.hide_discounts && office?.hide_benefits) && (
      <section className="py-20" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Discounts */}
            {!office?.hide_discounts && (
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4" style={{ backgroundColor: '#fcf4e4' + '10' }}>
                <Percent className="w-4 h-4" style={{ color: '#fcf4e4' }} />
                <span className="text-sm font-bold" style={{ color: '#fcf4e4' }}>
                  {pick(office?.discounts_badge_ua, office?.discounts_badge_ru, t('office.discounts.badge'))}
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                {pick(office?.discounts_title_ua, office?.discounts_title_ru, t('office.discounts.title'))}
              </h3>
              <p className="text-lg font-medium mb-6" style={{ color: '#fcf4e4' }}>
                {pick(office?.discounts_desc_ua, office?.discounts_desc_ru, t('office.discounts.desc'))}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { title: pick(office?.tier1_title_ua, office?.tier1_title_ru, t('office.discounts.tier1.title')), desc: pick(office?.tier1_desc_ua, office?.tier1_desc_ru, t('office.discounts.tier1.desc')) },
                  { title: pick(office?.tier2_title_ua, office?.tier2_title_ru, t('office.discounts.tier2.title')), desc: pick(office?.tier2_desc_ua, office?.tier2_desc_ru, t('office.discounts.tier2.desc')) },
                  { title: pick(office?.tier3_title_ua, office?.tier3_title_ru, t('office.discounts.tier3.title')), desc: pick(office?.tier3_desc_ua, office?.tier3_desc_ru, t('office.discounts.tier3.desc')) },
                ].map((tier, i) => (
                  <div key={i} className="p-6 rounded-lg text-center shadow-lg" style={{ backgroundColor: '#fcf4e4' }}>
                    <div className="text-4xl font-black mb-2 font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>{tier.title}</div>
                    <div className="text-sm md:text-base font-medium" style={{ color: '#361c0c' }}>{tier.desc}</div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-xl font-black mb-3 font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                  {pick(office?.combos_title_ua, office?.combos_title_ru, t('office.discounts.combos.title'))}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fcf4e4' }}></div>
                    <span className="text-base font-medium" style={{ color: '#fcf4e4' }}>
                      {pick(office?.combos_point1_ua, office?.combos_point1_ru, t('office.discounts.combos.point1'))}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2" style={{ backgroundColor: '#fcf4e4' }}></div>
                    <span className="text-base font-medium" style={{ color: '#fcf4e4' }}>
                      {pick(office?.combos_point2_ua, office?.combos_point2_ru, t('office.discounts.combos.point2'))}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            )}

            {/* Benefits */}
            {!office?.hide_benefits && (
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
            )}
          </div>
        </div>
      </section>
      )}

      {/* Custom sections at 'after-benefits' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-benefits' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

      {/* CTA */}
      {!office?.hide_cta && (
      <section className="py-20" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-5xl font-black mb-6 font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>
            {pick(office?.cta_title_ua, office?.cta_title_ru, t('office.cta.title'))}
          </h3>
          <p className="text-lg font-medium mb-8" style={{ color: '#361c0c' }}>
            {pick(office?.cta_subtitle_ua, office?.cta_subtitle_ru, t('office.cta.subtitle'))}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={`tel:${office?.cta_phone || '+380501234567'}`} className="group/btn px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] transition-all duration-300" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
              <span className="flex items-center space-x-3 group-hover/btn:text-[#fcf4e4]">
                <Phone className="w-5 h-5" />
                <span>{pick(office?.cta_call_text_ua, office?.cta_call_text_ru, t('office.cta.call'))}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </a>
            <a href={`mailto:${office?.cta_email || 'info@coffeemanifest.com'}`} className="group/btn px-8 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] transition-all duration-300" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
              <span className="flex items-center space-x-3 group-hover/btn:text-[#fcf4e4]">
                <Mail className="w-5 h-5" />
                <span>{pick(office?.cta_email_text_ua, office?.cta_email_text_ru, t('office.cta.email'))}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>
        </div>
      </section>
      )}

      {/* Custom sections at 'after-cta' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-cta' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

      <Footer />
    </div>
  );
}


