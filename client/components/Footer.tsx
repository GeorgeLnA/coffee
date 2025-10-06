import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, Clock, ArrowRight, Coffee, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
      <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Logo & Brand - Clean */}
            <div className="md:col-span-1">
              <div className="mb-8">
                <img 
                  src="/manifest-site-logo.png" 
                  alt="THE COFFEE Manifest" 
                  className="h-16 w-auto mb-6"
                />
                <p className="text-white/80 font-medium leading-relaxed">
                  {t('footer.description')}
                </p>
              </div>
              
              {/* Social Links - Clean */}
              <div className="flex space-x-4">
                <a href="#" className="group w-12 h-12 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                  <Facebook className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="group w-12 h-12 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                  <Instagram className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="group w-12 h-12 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                  <MessageCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Quick Links - Clean */}
            <div className="md:col-span-1">
              <h4 className="text-xl font-black mb-8" style={{ color: '#fcf4e4' }}>{t('footer.quickLinks')}</h4>
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
              </nav>
            </div>

            {/* Contact Info - Clean */}
            <div className="md:col-span-1">
              <h4 className="text-xl font-black mb-8" style={{ color: '#fcf4e4' }}>{t('footer.contactUs')}</h4>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-lg">067 000 24 18</p>
                    <p className="text-white/60 text-sm">{t('footer.callAnytime')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-lg break-all">info@coffeemanifest.com</p>
                    <p className="text-white/60 text-sm">{t('footer.generalQuestions')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Coffee className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-lg break-all">office@coffeemanifest.com</p>
                    <p className="text-white/60 text-sm">{t('footer.officeMachines')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-lg">Київ, Україна</p>
                    <p className="text-white/60 text-sm">{t('footer.visitCafes')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* News & Newsletter - Clean */}
            <div className="md:col-span-1">
              <h4 className="text-xl font-black mb-8" style={{ color: '#fcf4e4' }}>{t('footer.news')}</h4>
              

              {/* Newsletter Signup - Clean */}
              <div className="bg-white/5 backdrop-blur-sm p-6">
                <h5 className="text-white font-black text-lg mb-3">{t('footer.stayInformed')}</h5>
                <p className="text-white/60 text-sm mb-6 font-medium">{t('footer.newsletterDesc')}</p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder={t('footer.emailPlaceholder')} 
                    className="w-full px-4 py-3 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-300"
                  />
                  <button className="w-full px-6 py-3 bg-transparent border-2 border-white text-white font-black hover:bg-white hover:text-[#361c0c] transition-all duration-300">
                    <span className="flex items-center justify-center space-x-2">
                      <span>{t('footer.subscribe')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Clean */}
        <div className="border-t border-white/20 py-8">
          <div className="text-center">
            <p className="text-white/60 font-bold text-sm md:text-base">
              © 2024 THE COFFEE MANIFEST. {t('footer.rightsReserved')}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
