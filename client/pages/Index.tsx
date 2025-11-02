import { ChevronRight, MapPin, ArrowRight, Coffee, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BlogModal from "../components/BlogModal";
// import ColorThemePanel from "../components/ColorThemePanel";
import { Button } from "../components/ui/button";
import GoogleMapsMap from "../components/GoogleMapsMap";
import { useRef, useState, useEffect } from "react";
import CoffeeBeanAnimation from "../components/CoffeeBeanAnimation";
import { useLanguage } from "../contexts/LanguageContext";
import SeasonCarousel from "../components/SeasonCarousel";
import { useHomepageSettings, useFeaturedSlides } from "../hooks/use-supabase";
import { usePageSections } from "@/hooks/use-supabase";
import { CustomSection } from "@/components/CustomSection";

export default function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t, language } = useLanguage();
  
  // Fetch data from Supabase CMS
  const { data: homepageSettings } = useHomepageSettings();
  const { data: featuredSlides } = useFeaturedSlides();
  const { data: customSections } = usePageSections('home');
  
  // Trade points state
  const [selectedTradePoint, setSelectedTradePoint] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Modal state
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Update time every minute to refresh open/closed status
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Check if trading points are currently open based on Kyiv time
  const getKyivTime = () => {
    const kyivTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Europe/Kiev"}));
    return kyivTime;
  };

  const isCurrentlyOpen = (dayOfWeek: number, openHour: number, closeHour: number) => {
    const kyivTime = getKyivTime();
    const currentDay = kyivTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentHour = kyivTime.getHours();
    
    return currentDay === dayOfWeek && currentHour >= openHour && currentHour < closeHour;
  };

  // Use hardcoded trade points
  const tradePoints = [
    {
      name: t('cafes.cafe1.name'),
      address: t('cafes.cafe1.address'),
      active: isCurrentlyOpen(6, 6, 14), // Saturday, 6:00-14:00
      hours: t('cafes.cafe1.hours'),
      lat: 50.4067,
      lng: 30.6493
    },
    {
      name: t('cafes.cafe2.name'),
      address: t('cafes.cafe2.address'),
      active: isCurrentlyOpen(0, 6, 14), // Sunday, 6:00-14:00
      hours: t('cafes.cafe2.hours'),
      lat: 50.3824,
      lng: 30.4590
    }
  ];

  // Use hardcoded news articles
  const newsArticles = [
    {
      id: 1,
      title: t('news.article1.title'),
      excerpt: t('news.article1.excerpt'),
      content: `Кава також стала формою підтримки. Через щось настільки повсякденне, як чашка кави, кожен громадянин може відчути свій зв'язок з колективом. У часи випробувань кава об'єднує людей, дає відчуття звичайності та стабільності. Вона стає символом єдності та взаємної підтримки.`,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/48fca8d935a28fbac0cc9a8942725c2a971d05a2?width=811",
      category: t('news.article1.category'),
      author: "THE COFFEE MANIFEST Team",
      date: "15 грудня 2024",
      readTime: "5 хв"
    },
    {
      id: 2,
      title: t('news.article2.title'),
      excerpt: t('news.article2.excerpt'),
      content: `У кавовій культурі йде постійна дискусія про найкращий спосіб розкрити аромат і смаковий профіль вашої улюбленої кави. Щоб допомогти вам вибрати, ми розглянемо обидва методи детально. Batch Brew пропонує консистентність та зручність, тоді як Pour Over дозволяє більше контролю над процесом заварювання.`,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/8b7e355094a1a12ea7d37e5c5743479e75c0eaf5?width=811",
      category: t('news.article2.category'),
      author: "THE COFFEE MANIFEST Team",
      date: "12 грудня 2024",
      readTime: "7 хв"
    },
    {
      id: 3,
      title: t('news.article3.title'),
      excerpt: t('news.article3.excerpt'),
      content: `Секрет відмінної чашки кави полягає у високоякісних зернах та вмінні їх обсмажувати. Це етап, де народжується смак, розкриваються аромати та створюється унікальний профіль кожної кави. Наші майстри обсмажування використовують найсучасніше обладнання та багаторічний досвід для створення ідеального балансу смаку.`,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/48fca8d935a28fbac0cc9a8942725c2a971d05a2?width=811",
      category: t('news.article3.category'),
      author: "THE COFFEE MANIFEST Team",
      date: "10 грудня 2024",
      readTime: "6 хв"
    }
  ];

  // Modal functions
  const openModal = (article: any) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const getCurrentArticleIndex = () => {
    if (!selectedArticle) return -1;
    return newsArticles.findIndex(article => article.id === selectedArticle.id);
  };

  const goToPrevious = () => {
    const currentIndex = getCurrentArticleIndex();
    if (currentIndex > 0) {
      setSelectedArticle(newsArticles[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    const currentIndex = getCurrentArticleIndex();
    if (currentIndex < newsArticles.length - 1) {
      setSelectedArticle(newsArticles[currentIndex + 1]);
    }
  };

  const currentIndex = getCurrentArticleIndex();

  // Use CMS featured products if available, otherwise fallback to hardcoded
  const seasonItems = featuredSlides?.length ? featuredSlides.map(slide => ({
    id: `${slide.id}`,
    title: language === 'ru' ? (slide.title_ru || slide.title_ua) : (slide.title_ua || slide.title_ru),
    desc: language === 'ru' ? (slide.description_ru || slide.description_ua || '') : (slide.description_ua || slide.description_ru || ''),
    image: slide.image_url || '/250-g_Original.PNG',
    hoverImage: slide.hover_image_url || '/woocommerce-placeholder_Original.PNG',
    href: slide.link_url || '/coffee',
    customLabel: language === 'ru' ? slide.custom_label_ru : slide.custom_label_ua,
    customLabelColor: slide.custom_label_color,
    customLabelTextColor: slide.custom_label_text_color,
    labelImageUrl: slide.label_image_url
  })) : [
    {
      id: 'colombia',
      title: t('season.colombia.title'),
      desc: t('season.colombia.desc'),
      image: '/250-g_Original.PNG',
      hoverImage: '/woocommerce-placeholder_Original.PNG',
      href: '/coffee'
    },
    {
      id: 'ethiopia',
      title: t('season.ethiopia.title'),
      desc: t('season.ethiopia.desc'),
      image: '/250-g_Original.PNG',
      hoverImage: '/woocommerce-placeholder_Original.PNG',
      href: '/coffee'
    },
    {
      id: 'brazil',
      title: t('season.brazil.title'),
      desc: t('season.brazil.desc'),
      image: '/250-g_Original.PNG',
      hoverImage: '/woocommerce-placeholder_Original.PNG',
      href: '/coffee'
    }
  ];

  const gridCols = seasonItems.length === 1
    ? 'md:grid-cols-1 lg:grid-cols-1'
    : seasonItems.length === 2
      ? 'md:grid-cols-2 lg:grid-cols-2'
      : 'md:grid-cols-2 lg:grid-cols-3';
  const gridGap = seasonItems.length === 2 ? 'gap-8 lg:gap-10' : 'gap-12';
  const gridJustify = seasonItems.length <= 2 ? 'justify-items-center' : '';
  const cardWidthClass = seasonItems.length <= 2 ? 'max-w-xl mx-auto w-full' : 'w-full';

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
              src={homepageSettings?.hero_video_url || homepageSettings?.hero_video || "/Coffee_beans_fly_202510011757_183lh.mp4"}
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
                <h1 className="text-7xl md:text-9xl lg:text-9xl font-black mb-8 leading-tight font-dosis tracking-wider text-white">
                  <span className="block">{homepageSettings?.hero_title_line1 || "THE"}</span>
                  <span className="block">{homepageSettings?.hero_title_line2 || "COFFEE"}</span>
                  <span className="block">{homepageSettings?.hero_title_line3 || "MANIFEST"}</span>
                </h1>
                
                {/* CTA Button - Clean */}
                <Link to={homepageSettings?.hero_cta_link || "/coffee"} className="group inline-block px-12 py-6 bg-transparent border-2 border-white text-white font-black text-xl hover:bg-[#fcf4e4] hover:text-[#361c0c] transition-all duration-300">
                  <span className="flex items-center space-x-4">
                    <span>{homepageSettings?.hero_cta_text || t('hero.cta')}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Link>
                
              </div>
            </div>
          </section>

      {/* Minimalistic Coffee Bean Disintegration Animation (Canvas) - Hidden for now */}
      {/* <CoffeeBeanAnimation /> */}

      {/* We Create Something Unique - Dynamic Background */}
      {!homepageSettings?.hide_season && (
      <section className="py-16 md:py-32 relative overflow-hidden z-10" style={{ backgroundColor: '#361c0c', marginTop: '100vh' }}>
        {/* Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-coffee-accent  blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-coffee-green  blur-3xl opacity-10"></div>
        
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Section Header - Bold & Centered */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
              <span style={{ color: '#fcf4e4' }}>{homepageSettings?.season_title || t('season.title')}</span>
            </h2>
          </div>

          {/* Desktop Grid - Hidden on mobile (dynamic by number of slides) */}
          <div className={`hidden md:grid ${gridCols} ${gridGap} ${gridJustify} max-w-8xl mx-auto`}>
            {seasonItems.map((item) => (
              <Link key={item.id} to={item.href} className={`group block ${cardWidthClass}`}>
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-6" style={{ backgroundColor: '#fcf4e4' }}>
                  <div className="absolute inset-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-cover group-hover:opacity-0 transition-opacity duration-700 absolute bottom-0 left-0"
                      style={{ width: '80%', height: '80%' }}
                    />
                    <img
                      src={item.hoverImage}
                      alt={item.title}
                      className="object-cover absolute bottom-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{ width: '80%', height: '80%' }}
                    />
                  </div>
                  
                  {/* External Label Image (preferred) */}
                  {item.labelImageUrl && (
                    <div className="absolute top-2 right-2" style={{ width: 'clamp(120px, 30%, 250px)' }}>
                      <img src={item.labelImageUrl} alt="label" className="w-full h-auto" />
                    </div>
                  )}
                  
                  {/* Custom Label Text (if no image and has text) */}
                  {!item.labelImageUrl && item.customLabel && (
                    <div className="absolute left-4 top-4">
                      <span 
                        className="px-3 py-1 text-sm font-bold rounded-full shadow-lg"
                        style={{
                          backgroundColor: item.customLabelColor || '#f59e0b',
                          color: item.customLabelTextColor || '#92400e'
                        }}
                      >
                        {item.customLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-4xl font-black font-coolvetica tracking-wider uppercase mb-4" style={{ color: '#fcf4e4' }}>
                    {item.title}
                  </h3>
                  <div className="font-medium text-lg" style={{ color: '#fcf4e4' }}>
                    {item.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Carousel - Visible only on mobile */}
          <SeasonCarousel items={seasonItems} intervalMs={3000} />

          {/* Bottom CTA - Bold */}
          <div className="text-center mt-16">
            <Link to="/coffee" className="group px-12 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300 inline-block" style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}>
              <span className="flex items-center space-x-3 group-hover:text-[#361c0c]">
                <span>{t('season.learnMore')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Custom sections at 'after-season' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-season' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

      {/* Video Section - Clean & Minimalistic */}
      {!homepageSettings?.hide_video && (
      <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Video Side */}
            <div className="relative">
              <div className="relative overflow-hidden">
                 <video 
                   ref={videoRef}
                   src={homepageSettings?.video_url || "/Macro_shot_of_202509171627_znyzw.mp4"} 
                   autoPlay 
                   muted 
                   loop 
                   playsInline
                   className="w-full h-[500px] object-cover"
                   style={{ transform: 'scale(1.1)' }}
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
              
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Custom sections at 'after-video' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-video' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

          {/* About Section - Clean & Minimalistic */}
          {!homepageSettings?.hide_about && (
          <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Content Side - Clean */}
            <div className="order-2 lg:order-1">
              <div className="mb-12">
                <div className="inline-block px-6 py-3 mb-8" style={{ backgroundColor: '#361c0c' }}>
                  <span className="text-white font-black text-sm uppercase tracking-wider">{t('about.badge')}</span>
                </div>
                
                 <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
                   <span style={{ color: '#361c0c' }}>{t('about.title')}</span>
                 </h2>
                
                    <p className="text-xl text-gray-700 font-medium leading-relaxed mb-8">
                      {t('about.desc1')}
                    </p>

                    <p className="text-lg text-gray-700 font-medium leading-relaxed mb-12">
                      {t('about.desc2')}
                    </p>
              </div>


              {/* CTA Button - Clean */}
              <button className="group px-12 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] transition-all duration-300" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
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
                  src={homepageSettings?.about_image_url || "/photo_2023-11-03_07-29-18.jpg"} 
                  alt="THE COFFEE MANIFEST Team" 
                  className="w-full h-[600px] object-cover"
                  style={{ objectPosition: '35% center' }}
                />
                
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Custom sections at 'after-about' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-about' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

      {/* Our Cafes - Clean & Minimalistic */}
      {!homepageSettings?.hide_cafes && (
      <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#361c0c' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Header - Clean */}
          <div className="text-center mb-20">
             <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
               <span style={{ color: '#fcf4e4' }}>{t('cafes.title1')}</span>
               <span className="block" style={{ color: '#fcf4e4' }}>{t('cafes.title2')}</span>
             </h2>
          </div>

          {/* Map - Google Maps with markers */}
          <div className="mb-20">
            <div className="h-[600px] relative overflow-hidden rounded-lg bg-gray-200">
              <GoogleMapsMap
                tradePoints={tradePoints}
                selectedIndex={selectedTradePoint}
                onSelect={setSelectedTradePoint}
              />
            </div>
          </div>

          {/* Cafe List - Clean Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16 max-w-8xl mx-auto">
            {tradePoints.map((cafe, index) => (
              <div 
                key={index} 
                onClick={() => {
                  setSelectedTradePoint(index);
                }}
                className={`group relative backdrop-blur-sm p-6 md:p-10 border transition-all duration-300 cursor-pointer rounded-lg ${
                  selectedTradePoint === index 
                    ? 'bg-white/20 border-white/40 shadow-lg' 
                    : 'bg-white/10 border-white/20 hover:bg-white/20 hover:shadow-md'
                }`}
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${cafe.active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-white/70 font-medium">
                      {cafe.active ? 'Відкрито' : 'Закрито'}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium">{cafe.hours}</div>
                </div>
                
                {/* Icon */}
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 flex items-center justify-center mb-4 md:mb-6 rounded-lg">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="text-base md:text-lg font-black text-white mb-2 font-coolvetica tracking-wider">
                    {cafe.name}
                  </h3>
                  <p className="text-white/80 font-medium text-sm md:text-base leading-relaxed">
                    {cafe.address}
                  </p>
                </div>
                
                {/* Selection Indicator */}
                {selectedTradePoint === index && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>


        </div>
      </section>
      )}

      {/* Custom sections at 'after-cafes' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-cafes' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

          {/* News Section - Clean & Minimalistic */}
          {!homepageSettings?.hide_news && (
          <section className="py-32 relative overflow-hidden" style={{ backgroundColor: '#fcf4e4' }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Header - Clean */}
          <div className="text-center mb-20">
             <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight font-coolvetica tracking-wider">
               <span style={{ color: '#361c0c' }}>{t('news.title1')}</span>
               <br />
               <span style={{ color: '#361c0c' }}>{t('news.title2')}</span>
             </h2>
          </div>

          {/* Articles Grid - Clean */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 items-stretch">
            {newsArticles.map((article, index) => (
              <article key={index} className="group relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col" style={{ backgroundColor: '#361c0c' }}>
                {/* Image */}
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 text-white font-black text-sm" style={{ backgroundColor: '#361c0c' }}>
                      {article.category}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black mb-4 leading-tight font-coolvetica tracking-wider" style={{ color: '#fcf4e4' }}>
                    {article.title}
                  </h3>
                  <p className="font-medium leading-relaxed mb-6 flex-grow" style={{ color: '#fcf4e4' }}>
                    {article.excerpt}
                  </p>
                  
                    {/* Learn More Button */}
                    <button 
                      onClick={() => openModal(article)}
                      className="group/btn w-full px-6 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#fcf4e4] transition-all duration-300 mt-auto" 
                      style={{ borderColor: '#fcf4e4', color: '#fcf4e4' }}
                    >
                      <span className="flex items-center justify-center space-x-3">
                        <span className="group-hover/btn:text-[#361c0c]">{t('news.learnMore')}</span>
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform group-hover/btn:text-[#361c0c]" />
                      </span>
                    </button>
                </div>
              </article>
            ))}
          </div>

            {/* All News Button */}
            <div className="text-center">
              <Link to="/news" className="group px-12 py-4 bg-transparent border-2 font-black text-lg hover:bg-[#361c0c] transition-all duration-300 inline-block" style={{ borderColor: '#361c0c', color: '#361c0c' }}>
                <span className="flex items-center space-x-3">
                  <span className="group-hover:text-[#fcf4e4]">{t('news.viewAll')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform group-hover:text-[#fcf4e4]" />
                </span>
              </Link>
            </div>
        </div>
      </section>
      )}

      {/* Custom sections at 'after-news' anchor */}
      {(customSections || []).filter(s => s.anchor_key === 'after-news' && s.active !== false).map((s) => (
        <CustomSection key={s.id} {...s} />
      ))}

      {/* Footer */}
      <Footer />


          {/* Blog Modal */}
          <BlogModal
            isOpen={isModalOpen}
            onClose={closeModal}
            article={selectedArticle}
            onPrevious={goToPrevious}
            onNext={goToNext}
            hasPrevious={currentIndex > 0}
            hasNext={currentIndex < newsArticles.length - 1}
          />

          {/* Color Theme Panel */}
          {/* <ColorThemePanel /> */}
        </div>
      );
    }
