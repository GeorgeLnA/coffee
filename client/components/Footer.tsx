import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, Clock, ArrowRight, Coffee, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-coffee-green relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-coffee-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-coffee-accent/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-coffee-accent/20 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Logo & Brand - Bold */}
            <div className="md:col-span-1">
              <div className="mb-8">
                <img 
                  src="/manifest-site-logo.png" 
                  alt="THE COFFEE Manifest" 
                  className="h-16 w-auto mb-6"
                />
                <p className="text-coffee-text-primary/80 font-bold leading-relaxed">
                  Де кожна чашка розповідає історію пристрасті, точності та досконалості.
                </p>
              </div>
              
              {/* Social Links - Bold */}
              <div className="flex space-x-4">
                <a href="#" className="group w-14 h-14 bg-coffee-accent rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300">
                  <Facebook className="w-6 h-6 text-coffee-green group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="group w-14 h-14 bg-coffee-accent rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300">
                  <Instagram className="w-6 h-6 text-coffee-green group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="group w-14 h-14 bg-coffee-accent rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300">
                  <MessageCircle className="w-6 h-6 text-coffee-green group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Quick Links - Bold */}
            <div className="md:col-span-1">
              <h4 className="text-xl font-black text-coffee-accent mb-8">ШВИДКІ ПОСИЛАННЯ</h4>
              <nav className="space-y-4">
                <a href="#blog" className="group flex items-center text-coffee-text-primary font-bold hover:text-coffee-accent transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  Блог
                </a>
                <a href="#contacts" className="group flex items-center text-coffee-text-primary font-bold hover:text-coffee-accent transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  Контакти
                </a>
                <a href="#about" className="group flex items-center text-coffee-text-primary font-bold hover:text-coffee-accent transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  Про нас
                </a>
                <a href="#delivery" className="group flex items-center text-coffee-text-primary font-bold hover:text-coffee-accent transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  Доставка та оплата
                </a>
                <a href="#vacancies" className="group flex items-center text-coffee-text-primary font-bold hover:text-coffee-accent transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  Вакансії
                </a>
                <a href="#faq" className="group flex items-center text-coffee-text-primary font-bold hover:text-coffee-accent transition-all duration-300">
                  <ArrowRight className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                  FAQ
                </a>
              </nav>
            </div>

            {/* Contact Info - Bold */}
            <div className="md:col-span-1">
              <h4 className="text-xl font-black text-coffee-accent mb-8">ЗВ'ЯЖІТЬСЯ З НАМИ</h4>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-coffee-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-coffee-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-coffee-text-primary font-bold text-lg">067 000 24 18</p>
                    <p className="text-coffee-text-primary/80 text-sm">Дзвоніть будь-коли</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-coffee-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-coffee-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-coffee-text-primary font-bold text-lg break-all">info@coffeemanifest.com</p>
                    <p className="text-coffee-text-primary/80 text-sm">Напишіть нам</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-coffee-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-coffee-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-coffee-text-primary font-bold text-lg">Київ, Україна</p>
                    <p className="text-coffee-text-primary/80 text-sm">Відвідайте наші кав'ярні</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours & Newsletter - Bold */}
            <div className="md:col-span-1">
              <h4 className="text-xl font-black text-coffee-accent mb-8">ГОДИНИ РОБОТИ ТА ОНОВЛЕННЯ</h4>
              
              <div className="mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-coffee-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-coffee-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-coffee-text-primary font-bold text-lg">Monday - Friday</p>
                    <p className="text-coffee-text-primary/80 text-sm">9:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-coffee-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Coffee className="w-6 h-6 text-coffee-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-coffee-text-primary font-bold text-lg">Saturday - Sunday</p>
                    <p className="text-coffee-text-primary/80 text-sm">10:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Newsletter Signup - Bold */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h5 className="text-coffee-text-primary font-black text-lg mb-3">БУДЬТЕ В КУРСІ</h5>
                <p className="text-coffee-text-primary/80 text-sm mb-6 font-medium">Отримуйте останні кавові новини та пропозиції</p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Введіть вашу електронну адресу" 
                    className="w-full px-4 py-3 bg-white/20 text-coffee-text-primary placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:bg-white/30 transition-all duration-300"
                  />
                  <button className="w-full px-6 py-3 bg-coffee-accent text-coffee-green font-black rounded-xl hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-coffee-accent/50">
                    <span className="flex items-center justify-center space-x-2">
                      <span>ПІДПИСАТИСЯ</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Bold */}
        <div className="border-t border-coffee-accent/30 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 md:space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-coffee-accent rounded flex items-center justify-center">
                  <span className="text-coffee-green font-black text-sm">V</span>
                </div>
                <span className="text-coffee-text-primary font-bold text-sm md:text-base">VISA</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-coffee-accent rounded flex items-center justify-center">
                  <span className="text-coffee-green font-black text-sm">M</span>
                </div>
                <span className="text-coffee-text-primary font-bold text-sm md:text-base">MASTERCARD</span>
              </div>
            </div>
            
            <p className="text-coffee-text-primary/60 font-bold text-sm md:text-base text-center md:text-right">
              © 2024 THE COFFEE MANIFEST. ВСІ ПРАВА ЗАХИЩЕНО.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
