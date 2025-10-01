import { ChevronRight, MapPin, ArrowRight, Coffee, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";
// import ColorThemePanel from "../components/ColorThemePanel";
import { Button } from "../components/ui/button";
import { useRef } from "react";
import CoffeeBeanAnimation from "../components/CoffeeBeanAnimation";
import { useLanguage } from "../contexts/LanguageContext";

export default function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useLanguage();

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="min-h-screen bg-coffee-background">
      {/* Header */}
      <Header />

          {/* Hero Section - Bold & Immersive */}
          <section className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0">
            <video 
              src="/Coffee_beans_fly_202510011757_183lh.mp4" 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover scale-105"
            />
        
            {/* Hero Overlay - Bold Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60"></div>
            
            {/* Hero Content - Bold & Centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-4xl mx-auto px-6">
                {/* Main Title - Bold & Animated */}
                 <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black mb-8 leading-tight font-dosis tracking-wider" style={{ color: '#fcf4e4', mixBlendMode: 'overlay' }}>
                   <span className="block">THE</span>
                   <span className="block">COFFEE</span>
                   <span className="block">MANIFEST</span>
                 </h1>
                 
                 
                {/* CTA Button - Clean */}
                <Link to="/coffee" className="group inline-block px-12 py-6 bg-transparent border-2 border-white text-white font-black text-xl hover:bg-[#fcf4e4] hover:text-[#3b0b0b] transition-all duration-300">
                  <span className="flex items-center space-x-4">
                    <span>{t('hero.cta')}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Link>
                
              </div>
            </div>
          </section>

      {/* Minimalistic Coffee Bean Disintegration Animation (Canvas) - Hidden for now */}
      {/* <CoffeeBeanAnimation /> */}

      {/* We Create Something Unique - Dynamic Background */}
      <section className="py-16 md:py-32 relative overflow-hidden z-10" style={{ backgroundColor: '#3b0b0b', marginTop: '100vh' }}>
        {/* Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-coffee-accent  blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-coffee-green  blur-3xl opacity-10"></div>
        
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Section Header - Bold & Centered */}
          <div className="text-center mb-20">
             <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
               <span style={{ color: '#fcf4e4' }}>{t('season.title')}</span>
             </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-8xl mx-auto">
            {/* Coffee for Home - Colombia Supremo */}
            <Link to="/coffee" className="group block">
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-6">
                <div className="absolute inset-0 ">
                  <img
                    src="/250-g_Original.PNG"
                    alt="Colombia Supremo Coffee"
                    className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-700"
                  />
                  <img
                    src="/woocommerce-placeholder_Original.PNG"
                    alt="Colombia Supremo Coffee"
                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-4xl font-black font-coolvetica tracking-wider uppercase mb-4" style={{ color: '#fcf4e4' }}>
                  {t('season.colombia.title')}
                </h3>
                <div className="font-medium text-lg" style={{ color: '#fcf4e4' }}>
                  {t('season.colombia.desc')}
                </div>
              </div>
            </Link>

            {/* Coffee for Office - Ethiopia Guji Organic */}
            <Link to="/coffee" className="group block">
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-6">
                <div className="absolute inset-0 ">
                  <img
                    src="/250-g_Original.PNG"
                    alt="Ethiopia Guji Organic Coffee"
                    className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-700"
                  />
                  <img
                    src="/woocommerce-placeholder_Original.PNG"
                    alt="Ethiopia Guji Organic Coffee"
                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-4xl font-black font-coolvetica tracking-wider uppercase mb-4" style={{ color: '#fcf4e4' }}>
                  {t('season.ethiopia.title')}
                </h3>
                <div className="font-medium text-lg" style={{ color: '#fcf4e4' }}>
                  {t('season.ethiopia.desc')}
                </div>
              </div>
            </Link>

            {/* Coffee for Business - Brazil Santos */}
            <Link to="/coffee" className="group block">
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-6">
                <div className="absolute inset-0 ">
                  <img
                    src="/250-g_Original.PNG"
                    alt="Brazil Santos Coffee"
                    className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-700"
                  />
                  <img
                    src="/woocommerce-placeholder_Original.PNG"
                    alt="Brazil Santos Coffee"
                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-4xl font-black font-coolvetica tracking-wider uppercase mb-4" style={{ color: '#fcf4e4' }}>
                  {t('season.brazil.title')}
                </h3>
                <div className="font-medium text-lg" style={{ color: '#fcf4e4' }}>
                  {t('season.brazil.desc')}
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom CTA - Bold */}
          <div className="text-center mt-16">
            <button className="group px-12 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
              <span className="flex items-center space-x-3 group-hover:text-[#3b0b0b]">
                <span>{t('season.learnMore')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Video Section - Clean & Minimalistic */}
      <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#3b0b0b' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Video Side */}
            <div className="relative">
              <div className="relative overflow-hidden">
                 <video 
                   ref={videoRef}
                   src="/Macro_shot_of_202509171627_znyzw.mp4" 
                   autoPlay 
                   muted 
                   loop 
                   playsInline
                   className="w-full h-[600px] object-cover"
                   style={{ transform: 'scale(1.15)' }}
                 />
              </div>
            </div>

            {/* Text Side - Clean */}
            <div className="space-y-8">
              <div>
                 <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
                   <span style={{ color: '#fcf4e4' }}>{t('video.title1')}</span>
                   <br />
                   <span style={{ color: '#fcf4e4' }}>{t('video.title2')}</span>
                 </h2>
              </div>
              
              <p className="text-xl text-white font-medium leading-relaxed">
                {t('video.desc')}
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2" style={{ backgroundColor: '#fcf4e4' }}></div>
                  <span className="text-white font-bold text-lg">{t('video.feature1')}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2" style={{ backgroundColor: '#fcf4e4' }}></div>
                  <span className="text-white font-bold text-lg">{t('video.feature2')}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2" style={{ backgroundColor: '#fcf4e4' }}></div>
                  <span className="text-white font-bold text-lg">{t('video.feature3')}</span>
                </div>
              </div>
              
              <button className="group px-12 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
                <span className="flex items-center space-x-3 group-hover:text-[#3b0b0b]">
                  <span>{t('video.watch')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

          {/* About Section - Clean & Minimalistic */}
          <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Content Side - Clean */}
            <div className="order-2 lg:order-1">
              <div className="mb-12">
                <div className="inline-block px-6 py-3 mb-8" style={{ backgroundColor: '#3b0b0b' }}>
                  <span className="text-white font-black text-sm uppercase tracking-wider">{t('about.badge')}</span>
                </div>
                
                 <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
                   <span style={{ color: '#3b0b0b' }}>{t('about.title')}</span>
                 </h2>
                
                    <p className="text-xl text-gray-700 font-medium leading-relaxed mb-8">
                      {t('about.desc1')}
                    </p>

                    <p className="text-lg text-gray-700 font-medium leading-relaxed mb-12">
                      {t('about.desc2')}
                    </p>
              </div>


              {/* CTA Button - Clean */}
              <button className="group px-12 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#3b0b0b] transition-all duration-300" style={{ borderColor: '#3b0b0b', color: '#3b0b0b' }}>
                <span className="flex items-center space-x-3">
                  <span className="group-hover:text-[#fcf4e4]">{t('about.learnMore')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform group-hover:text-[#fcf4e4]" />
                </span>
              </button>
            </div>

            {/* Image Side - Clean */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative">
                {/* Main Image */}
                <img 
                  src="/photo_2023-11-03_07-29-18.jpg" 
                  alt="THE COFFEE MANIFEST Team" 
                  className="w-full h-[600px] object-cover"
                  style={{ objectPosition: '35% center' }}
                />
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Cafes - Clean & Minimalistic */}
      <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#3b0b0b' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Header - Clean */}
          <div className="text-center mb-20">
             <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
               <span style={{ color: '#fcf4e4' }}>{t('cafes.title1')}</span>
               <span className="block" style={{ color: '#fcf4e4' }}>{t('cafes.title2')}</span>
             </h2>
          </div>

          {/* Map - Clean */}
          <div className="mb-20">
            <div className="h-[400px] relative overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.5!2d30.5234!3d50.4501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce4b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sKyiv%2C%20Ukraine!5e0!3m2!1sen!2sua!4v1234567890123!5m2!1sen!2sua"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="THE COFFEE MANIFEST Locations Map"
              />
            </div>
          </div>

          {/* Cafe List - Clean Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { name: t('cafes.cafe1.name'), address: t('cafes.cafe1.address'), active: true, hours: t('cafes.cafe1.hours') },
              { name: t('cafes.cafe2.name'), address: t('cafes.cafe2.address'), active: false, hours: t('cafes.cafe2.hours') },
              { name: t('cafes.cafe3.name'), address: t('cafes.cafe3.address'), active: false, hours: t('cafes.cafe3.hours') },
            ].map((cafe, index) => (
              <div key={index} className="group relative bg-white/10 backdrop-blur-sm p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-3 h-3 ${cafe.active ? 'bg-white' : 'bg-gray-400'}`}></div>
                  <div className="text-sm text-white font-medium">{cafe.hours}</div>
                </div>
                
                {/* Icon */}
                <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="text-lg font-black text-white mb-2 font-coolvetica tracking-wider">
                    {cafe.name}
                  </h3>
                  <p className="text-white/80 font-medium">
                    {cafe.address}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* All Cafes Button */}
          <div className="text-center">
            <button className="group px-12 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
              <span className="flex items-center space-x-3 group-hover:text-[#3b0b0b]">
                <span>{t('cafes.viewAll')}</span>
                <MapPin className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

          {/* News Section - Clean & Minimalistic */}
          <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Header - Clean */}
          <div className="text-center mb-20">
             <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
               <span style={{ color: '#3b0b0b' }}>{t('news.title1')}</span>
               <br />
               <span style={{ color: '#3b0b0b' }}>{t('news.title2')}</span>
             </h2>
          </div>

          {/* Articles Grid - Clean */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: t('news.article1.title'),
                excerpt: t('news.article1.excerpt'),
                image: "https://api.builder.io/api/v1/image/assets/TEMP/48fca8d935a28fbac0cc9a8942725c2a971d05a2?width=811",
                category: t('news.article1.category')
              },
              {
                title: t('news.article2.title'),
                excerpt: t('news.article2.excerpt'),
                image: "https://api.builder.io/api/v1/image/assets/TEMP/8b7e355094a1a12ea7d37e5c5743479e75c0eaf5?width=811",
                category: t('news.article2.category')
              },
              {
                title: t('news.article3.title'),
                excerpt: t('news.article3.excerpt'),
                image: "https://api.builder.io/api/v1/image/assets/TEMP/48fca8d935a28fbac0cc9a8942725c2a971d05a2?width=811",
                category: t('news.article3.category')
              }
            ].map((article, index) => (
              <article key={index} className="group relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: '#3b0b0b' }}>
                {/* Image */}
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 text-white font-black text-sm" style={{ backgroundColor: '#3b0b0b' }}>
                      {article.category}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-black mb-4 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                    {article.title}
                  </h3>
                  <p className="font-medium leading-relaxed mb-6" style={{ color: '#fcf4e4' }}>
                    {article.excerpt}
                  </p>
                  
                  {/* Learn More Button */}
                  <button className="group/btn w-full px-6 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
                    <span className="flex items-center justify-center space-x-3">
                      <span className="group-hover/btn:text-[#3b0b0b]">{t('news.learnMore')}</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform group-hover/btn:text-[#3b0b0b]" />
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* All News Button */}
          <div className="text-center">
            <button className="group px-12 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#3b0b0b] transition-all duration-300" style={{ borderColor: '#3b0b0b', color: '#3b0b0b' }}>
              <span className="flex items-center space-x-3">
                <span className="group-hover:text-[#fcf4e4]">{t('news.viewAll')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform group-hover:text-[#fcf4e4]" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

          {/* Floating Contact Widget */}
          <FloatingContact />

          {/* Color Theme Panel */}
          {/* <ColorThemePanel /> */}
        </div>
      );
    }
