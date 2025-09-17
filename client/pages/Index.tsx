import { ChevronRight, MapPin, ArrowRight, Coffee, Heart } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";
import { Button } from "../components/ui/button";
import { useRef } from "react";

export default function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section - Bold & Immersive */}
      <section className="relative h-[75vh] overflow-hidden">
        <video 
          src="/Slowmotion_splash_shot_202509171540.mp4" 
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
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
              THE COFFEE <span className="text-white">MANIFEST</span>
            </h1>
            
            {/* Subtitle - Bold & Elegant */}
            <p className="text-xl md:text-2xl text-white/90 font-bold mb-12 max-w-2xl mx-auto leading-relaxed">
              Де кожна чашка розповідає історію пристрасті, точності та досконалості
            </p>
            
          </div>
        </div>


      </section>

      {/* We Create Something Unique - White Background */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-coffee-accent rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-[#1f0a03] rounded-full blur-3xl opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Section Header - Bold & Centered */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black text-[#1f0a03] mb-8 leading-tight">
              МИ СТВОРЮЄМО
              <span className="block text-coffee-accent">ЩОСЬ УНІКАЛЬНЕ</span>
            </h2>
            <p className="text-xl text-gray-600 font-bold max-w-3xl mx-auto">
              Кожна чашка - це шедевр, створений з пристрастю, точністю та найкращими інгредієнтами
            </p>
            <div className="w-24 h-1 bg-coffee-accent mx-auto rounded-full mt-8"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Coffee for Home - Colombia Supremo */}
            <div className="group relative bg-white rounded-3xl overflow-hidden hover:scale-105 transition-all duration-500 shadow-2xl border border-gray-100">
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                 <img 
                   src="/colombia-supremo-coffeemanifest-250g.jpg" 
                   alt="Colombia Supremo Coffee" 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                 />
                
                {/* Product Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-coffee-accent text-[#1f0a03] font-black text-sm rounded-full">
                    КАВА ДЛЯ ДОМУ
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <h3 className="text-3xl font-black text-[#1f0a03] mb-4">
                  COLOMBIA SUPREMO
                </h3>
                <p className="text-gray-700 font-bold leading-relaxed text-lg mb-6">
                  Преміум кавові зерна одного походження з Колумбії. Ідеально підходить для домашнього заварювання з нотами сливи, абрикосу та шоколаду.
                </p>
                
                <div className="flex items-center text-coffee-accent font-black group-hover:translate-x-2 transition-transform text-xl">
                  <span>КУПИТИ КАВУ ДЛЯ ДОМУ</span>
                  <ChevronRight className="w-8 h-8 ml-3" />
                </div>
              </div>
            </div>

            {/* Coffee for Office - Ethiopia Guji Organic */}
            <div className="group relative bg-white rounded-3xl overflow-hidden hover:scale-105 transition-all duration-500 shadow-2xl border border-gray-100">
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                 <img 
                   src="/ethiopia-guji-organic-coffeemanifest-500g.jpg" 
                   alt="Ethiopia Guji Organic Coffee" 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                 />
                
                {/* Product Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-coffee-accent text-[#1f0a03] font-black text-sm rounded-full">
                    КАВА ДЛЯ ОФІСУ
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <h3 className="text-3xl font-black text-[#1f0a03] mb-4">
                  ETHIOPIA GUJI ORGANIC
                </h3>
                <p className="text-gray-700 font-bold leading-relaxed text-lg mb-6">
                  Органічна кавова суміш, ідеальна для офісних приміщень. Багаті смаки чорної смородини, чорниці, інжиру та гречаного меду.
                </p>
                
                <div className="flex items-center text-coffee-accent font-black group-hover:translate-x-2 transition-transform text-xl">
                  <span>ДОСЛІДИТИ ОФІСНІ РІШЕННЯ</span>
                  <ChevronRight className="w-8 h-8 ml-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA - Bold */}
          <div className="text-center mt-16">
            <button className="group px-16 py-6 bg-coffee-accent text-[#1f0a03] font-black text-2xl rounded-full hover:bg-[#1f0a03] hover:text-white transition-all duration-300 shadow-2xl hover:shadow-coffee-accent/50">
              <span className="flex items-center space-x-4">
                <span>ДІЗНАТИСЯ БІЛЬШЕ</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Video Section - Bold with Text */}
      <section className="py-32 bg-[#1f0a03] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-coffee-accent rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-coffee-accent rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Video Side */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <video 
                  ref={videoRef}
                  src="/Macro_shot_of_202509171627_znyzw.mp4" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-[600px] object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-coffee-accent rounded-full flex items-center justify-center shadow-2xl">
                <Coffee className="w-8 h-8 text-[#1f0a03]" />
              </div>
            </div>

            {/* Text Side - Bold */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
                  СТВОРЕНО
                  <br />
                  <span className="text-coffee-accent">ДОСКОНАЛІСТЬ</span>
                </h2>
                <div className="w-24 h-1 bg-coffee-accent rounded-full"></div>
              </div>
              
              <p className="text-xl text-gray-300 font-medium leading-relaxed">
                Кожна чашка розповідає історію пристрасті, точності та досконалості. 
                Від моменту вибору найкращих зерен до фінального наливання 
                ми забезпечуємо, що кожна деталь створена з турботою.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-coffee-accent rounded-full"></div>
                  <span className="text-white font-bold text-lg">Преміум якість зерен</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-coffee-accent rounded-full"></div>
                  <span className="text-white font-bold text-lg">Експертний процес обсмажування</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-coffee-accent rounded-full"></div>
                  <span className="text-white font-bold text-lg">Досконалі техніки заварювання</span>
                </div>
              </div>
              
              <button className="group px-12 py-6 bg-coffee-accent text-[#1f0a03] font-black text-xl rounded-full hover:bg-white hover:text-[#1f0a03] transition-all duration-300 shadow-2xl hover:shadow-coffee-accent/50">
                <span className="flex items-center space-x-4">
                  <span>ПОСПОСТЕРІГАЙТЕ НАШ ПРОЦЕС</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Bold & Inspiring */}
      <section className="py-32 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-64 h-64 bg-coffee-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#1f0a03]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Content Side - Bold */}
            <div className="order-2 lg:order-1">
              <div className="mb-8">
                <div className="inline-block bg-coffee-accent px-6 py-3 rounded-full mb-8">
                  <span className="text-[#1f0a03] font-black text-sm uppercase tracking-wider">Про нас</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black text-[#1f0a03] mb-8 leading-tight">
                  THE COFFEE
                  <span className="block text-coffee-accent">MANIFEST</span>
                </h2>
                
                <p className="text-xl text-gray-700 font-bold leading-relaxed mb-8">
                  Ми не просто українська мережа кав'ярень третьої хвилі. Ми повноцінна кавова компанія, яка швидко та пристрасно розвивається.
                </p>
                
                <p className="text-lg text-gray-600 font-bold leading-relaxed mb-12">
                  Ми не просто продаємо каву — ми ретельно відбираємо зелені кавові зерна, обсмажуємо їх на високоякісному обладнанні та докладаємо всіх зусиль, щоб ви могли насолоджуватися розкошшю ароматного гарячого напою в чашці вдома, в офісі або в нашому закладі.
                </p>
              </div>

              {/* Stats - Bold */}
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-4xl font-black text-coffee-accent mb-2">50+</div>
                  <div className="text-gray-700 font-bold">Сортів кави</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-coffee-accent mb-2">1000+</div>
                  <div className="text-gray-700 font-bold">Задоволених клієнтів</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-coffee-accent mb-2">5</div>
                  <div className="text-gray-700 font-bold">Років досвіду</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-coffee-accent mb-2">24/7</div>
                  <div className="text-gray-700 font-bold">Свіже обсмажування</div>
                </div>
              </div>

              {/* CTA Button - Bold */}
              <button className="group px-12 py-6 bg-[#1f0a03] text-white font-black text-xl rounded-full hover:bg-coffee-accent hover:text-[#1f0a03] transition-all duration-300 shadow-2xl">
                <span className="flex items-center space-x-4">
                  <span>ДІЗНАТИСЯ БІЛЬШЕ</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </div>

            {/* Image Side - Bold */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative group">
                {/* Main Image */}
                <img 
                  src="/photo_2023-11-03_07-29-18.jpg" 
                  alt="THE COFFEE MANIFEST Team" 
                  className="w-full h-[700px] object-cover rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  style={{ objectPosition: '35% center' }}
                />
                
                
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-coffee-accent rounded-full flex items-center justify-center shadow-2xl">
                  <Coffee className="w-12 h-12 text-[#1f0a03]" />
                </div>
                
                
                {/* Image Caption */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="text-xl font-black text-[#1f0a03] mb-2">Наша історія</h3>
                    <p className="text-gray-700 font-bold">
                      Познайомтеся з пристрасною командою THE COFFEE MANIFEST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Cafes - New Layout */}
      <section className="py-32 bg-[#1f0a03] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-coffee-accent rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-coffee-accent rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Header - Bold */}
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
              НАШІ
              <span className="text-coffee-accent"> КАВ'ЯРНІ</span>
            </h2>
            <p className="text-xl text-gray-300 font-bold mb-8">
              Знайдіть нас по всьому Києву
            </p>
            <div className="w-24 h-1 bg-coffee-accent mx-auto rounded-full"></div>
          </div>

          {/* Map - Full Width */}
          <div className="mb-16">
            <div className="h-[400px] relative overflow-hidden rounded-3xl shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.5!2d30.5234!3d50.4501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce4b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sKyiv%2C%20Ukraine!5e0!3m2!1sen!2sua!4v1234567890123!5m2!1sen!2sua"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-3xl"
                title="THE COFFEE MANIFEST Locations Map"
              />
              
            </div>
          </div>

          {/* Cafe List - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { name: "Cafe (Golden Gate)", address: "Yaroslaviv Val, 15, Kyiv", active: true, hours: "7:00 - 22:00" },
              { name: "Cafe (CHICAGO Central House)", address: "St. Antonovycha, 44, Kyiv", active: false, hours: "8:00 - 23:00" },
              { name: "Cafe (BTC Maidan Plaza)", address: "Maidan Nezalezhnosti, 2, Kyiv", active: false, hours: "7:30 - 21:30" },
            ].map((cafe, index) => (
              <div key={index} className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-3 h-3 rounded-full ${cafe.active ? 'bg-coffee-accent' : 'bg-gray-400'} group-hover:scale-110 transition-transform`}></div>
                  <div className="text-sm text-gray-300 font-medium">{cafe.hours}</div>
                </div>
                
                {/* Icon */}
                <div className="w-12 h-12 bg-coffee-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-[#1f0a03]" />
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-coffee-accent transition-colors duration-300">
                    {cafe.name}
                  </h3>
                  <p className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
                    {cafe.address}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* All Cafes Button */}
          <div className="text-center">
            <button className="group px-16 py-6 bg-coffee-accent text-[#1f0a03] font-black text-2xl rounded-full hover:bg-white hover:text-[#1f0a03] transition-all duration-300 shadow-2xl hover:shadow-coffee-accent/50">
              <span className="flex items-center space-x-4">
                <span>ПЕРЕГЛЯНУТИ ВСІ КАВ'ЯРНІ</span>
                <MapPin className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* News Section - Bold */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-coffee-accent rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-[#1f0a03] rounded-full blur-3xl opacity-10"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Header - Bold */}
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-7xl font-black text-[#1f0a03] mb-6 leading-tight">
              НОВИНИ З
              <br />
              <span className="text-coffee-accent">КАВОВОГО СВІТУ</span>
            </h2>
            <p className="text-xl text-gray-600 font-bold mb-8">
              Будьте в курсі останніх кавових трендів та інсайтів
            </p>
            <div className="w-24 h-1 bg-coffee-accent mx-auto rounded-full"></div>
          </div>

          {/* Articles Grid - Bold */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Coffee for the military: how a simple drink…",
                excerpt: "Coffee has also become a form of support. Through something as everyday as a cup of coffee, every citizen can feel their connection to the collective…",
                image: "https://api.builder.io/api/v1/image/assets/TEMP/f442a83a29737ee4d1be7db1d482e0f89f83bac7?width=811",
                category: "Community"
              },
              {
                title: "Batch Brew vs. Pour Over: A Comparison of Method…",
                excerpt: "In coffee culture, there's an ongoing debate about the best way to bring out the aroma and flavor profile of your favorite brew. To help you choose the…",
                image: "https://api.builder.io/api/v1/image/assets/TEMP/8b7e355094a1a12ea7d37e5c5743479e75c0eaf5?width=811",
                category: "Brewing"
              },
              {
                title: "How We Roast Our Coffee",
                excerpt: "The secret to a great cup of coffee lies in high-quality beans and the skill of roasting them. This is the stage where flavor is born, aromas are unlocke…",
                image: "https://api.builder.io/api/v1/image/assets/TEMP/48fca8d935a28fbac0cc9a8942725c2a971d05a2?width=811",
                category: "Process"
              }
            ].map((article, index) => (
              <article key={index} className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100">
                {/* Image */}
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-coffee-accent text-[#1f0a03] font-black text-sm rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-black text-[#1f0a03] mb-4 leading-tight group-hover:text-coffee-accent transition-colors duration-300">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed mb-6 group-hover:text-gray-800 transition-colors duration-300">
                    {article.excerpt}
                  </p>
                  
                  {/* Learn More Button */}
                  <button className="group/btn w-full px-6 py-4 bg-[#1f0a03] text-white font-black text-lg rounded-2xl hover:bg-coffee-accent hover:text-[#1f0a03] transition-all duration-300 shadow-lg hover:shadow-xl">
                    <span className="flex items-center justify-center space-x-3">
                      <span>LEARN MORE</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* All News Button */}
          <div className="text-center">
            <button className="group px-16 py-6 bg-coffee-accent text-[#1f0a03] font-black text-2xl rounded-full hover:bg-[#1f0a03] hover:text-white transition-all duration-300 shadow-2xl hover:shadow-coffee-accent/50">
              <span className="flex items-center space-x-4">
                <span>ПЕРЕГЛЯНУТИ ВСІ НОВИНИ</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
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
