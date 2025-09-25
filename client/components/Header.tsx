import { Search, ShoppingCart, Menu, X, Coffee, Heart, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50; // Start changing as soon as we scroll 50px
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-coffee-green shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo - Bold & Centered */}
            <div className="flex-shrink-0 z-50">
              <a href="/" className="group">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src="/manifest-site-logo.png" 
                      alt="THE COFFEE Manifest" 
                      className="h-12 w-auto transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
              </a>
            </div>

            {/* Desktop Navigation - Bold & Spaced */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#coffee" className="group relative">
                <span className="text-coffee-text-primary font-bold text-lg tracking-wide hover:text-coffee-accent transition-all duration-300">
                  Кава
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coffee-accent group-hover:w-full transition-all duration-300"></div>
              </a>
              <a href="#water" className="group relative">
                <span className="text-coffee-text-primary font-bold text-lg tracking-wide hover:text-coffee-accent transition-all duration-300">
                  Вода
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coffee-accent group-hover:w-full transition-all duration-300"></div>
              </a>
              <a href="#drinks" className="group relative">
                <span className="text-coffee-text-primary font-bold text-lg tracking-wide hover:text-coffee-accent transition-all duration-300">
                  Напої
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coffee-accent group-hover:w-full transition-all duration-300"></div>
              </a>
              <a href="#about" className="group relative">
                <span className="text-coffee-text-primary font-bold text-lg tracking-wide hover:text-coffee-accent transition-all duration-300">
                  Про нас
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coffee-accent group-hover:w-full transition-all duration-300"></div>
              </a>
              <a href="#contacts" className="group relative">
                <span className="text-coffee-text-primary font-bold text-lg tracking-wide hover:text-coffee-accent transition-all duration-300">
                  Контакти
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coffee-accent group-hover:w-full transition-all duration-300"></div>
              </a>
              
              {/* Dropdown Menu */}
              <div className="relative group">
                <button 
                  className="flex items-center space-x-1 text-coffee-text-primary font-bold text-lg tracking-wide hover:text-coffee-accent transition-all duration-300"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <span>Більше</span>
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                
                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-48 bg-[#1f0a03] rounded-2xl shadow-2xl border border-coffee-accent/20 py-4 z-50"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <a href="#cooperation" className="block px-6 py-3 text-coffee-text-primary font-bold hover:bg-coffee-accent hover:text-[#1f0a03] transition-all duration-300">
                      Співпраця
                    </a>
                    <a href="#coffee-machines" className="block px-6 py-3 text-coffee-text-primary font-bold hover:bg-coffee-accent hover:text-[#1f0a03] transition-all duration-300">
                      Кавомашини
                    </a>
                    <a href="#privacy-policy" className="block px-6 py-3 text-coffee-text-primary font-bold hover:bg-coffee-accent hover:text-[#1f0a03] transition-all duration-300">
                      Політика конфіденційності
                    </a>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Side - Bold Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Language Switcher - Bold */}
              <div className="flex items-center space-x-1 bg-black/20 rounded-full p-1">
                <button className="px-4 py-2 text-coffee-text-primary font-bold text-sm rounded-full bg-coffee-accent transition-all duration-300">
                  UA
                </button>
                <button className="px-4 py-2 text-coffee-text-primary font-bold text-sm rounded-full hover:bg-white/10 transition-all duration-300">
                  RU
                </button>
              </div>

              {/* Search - Bold Icon */}
              <button className="p-3 bg-coffee-accent rounded-full hover:bg-coffee-accent/80 transition-all duration-300 group">
                    <Search className="w-5 h-5 text-coffee-green group-hover:scale-110 transition-transform" />
              </button>

              {/* Sign In - Bold Button */}
              <a href="#signin" className="px-6 py-3 bg-transparent border-2 border-coffee-accent text-coffee-accent font-bold rounded-full hover:bg-coffee-accent hover:text-coffee-green transition-all duration-300">
                Увійти
              </a>

              {/* Cart - Bold with Badge */}
              <button className="relative p-3 bg-coffee-beige rounded-full hover:bg-gray-100 transition-all duration-300 group">
                <ShoppingCart className="w-6 h-6 text-coffee-green group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-coffee-accent rounded-full flex items-center justify-center">
                  <span className="text-coffee-green font-bold text-xs">3</span>
                </div>
              </button>
            </div>

            {/* Mobile Header Actions */}
            <div className="lg:hidden flex items-center space-x-3">
              {/* Mobile Language Switcher */}
              <div className="flex items-center space-x-1 bg-black/20 rounded-full p-1">
                <button className="px-3 py-2 text-coffee-text-primary font-bold text-sm rounded-full bg-coffee-accent text-coffee-green transition-all duration-300">
                  UA
                </button>
                <button className="px-3 py-2 text-coffee-text-primary font-bold text-sm rounded-full hover:bg-white/10 transition-all duration-300">
                  RU
                </button>
              </div>
              
              {/* Mobile Menu Button - Bold */}
              <button 
                className="p-3 bg-coffee-accent rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-coffee-green" />
                ) : (
                  <Menu className="w-6 h-6 text-coffee-green" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Bold & Full Screen */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            {/* Top half with brown background */}
            <div className="bg-coffee-green pt-20 pb-8">
              <div className="px-6 py-8 space-y-8">
              <nav className="space-y-6">
                <a href="#coffee" className="block text-coffee-text-primary font-bold text-2xl hover:text-coffee-accent transition-colors">
                  Кава
                </a>
                <a href="#water" className="block text-coffee-text-primary font-bold text-2xl hover:text-coffee-accent transition-colors">
                  Вода
                </a>
                <a href="#drinks" className="block text-coffee-text-primary font-bold text-2xl hover:text-coffee-accent transition-colors">
                  Напої
                </a>
                <a href="#about" className="block text-coffee-text-primary font-bold text-2xl hover:text-coffee-accent transition-colors">
                  Про нас
                </a>
                <a href="#contacts" className="block text-coffee-text-primary font-bold text-2xl hover:text-coffee-accent transition-colors">
                  Контакти
                </a>
                
                {/* Additional Menu Items - Show/Hide */}
                {isMobileDropdownOpen && (
                  <>
                    <a href="#cooperation" className="block text-coffee-text-primary font-bold text-2xl hover:text-coffee-accent transition-colors">
                      Співпраця
                    </a>
                    <a href="#coffee-machines" className="block text-coffee-text-primary font-bold text-2xl hover:text-coffee-accent transition-colors">
                      Кавомашини
                    </a>
                    <a href="#privacy-policy" className="block text-coffee-text-primary font-bold text-2xl hover:text-coffee-accent transition-colors">
                      Політика конфіденційності
                    </a>
                  </>
                )}
                
                {/* More Button */}
                <button 
                  className="flex items-center space-x-2 text-coffee-text-primary font-bold text-2xl hover:text-coffee-accent transition-colors"
                  onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                >
                  <span>{isMobileDropdownOpen ? 'Менше' : 'Більше'}</span>
                  <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </nav>
                
                <div className="pt-8 border-t border-coffee-accent/30">
                  {/* Search & Basket Buttons */}
                  <div className="flex space-x-4 mb-6">
                    {/* Search Button */}
                    <button className="flex-1 flex items-center justify-center space-x-2 py-4 bg-white/10 text-coffee-text-primary font-bold rounded-full hover:bg-coffee-accent hover:text-[#1f0a03] transition-all duration-300">
                      <Search className="w-5 h-5" />
                      <span>Пошук</span>
                    </button>
                    
                    {/* Basket Button */}
                    <button className="relative flex-1 flex items-center justify-center space-x-2 py-4 bg-white/10 text-coffee-text-primary font-bold rounded-full hover:bg-coffee-accent hover:text-[#1f0a03] transition-all duration-300">
                      <ShoppingCart className="w-5 h-5" />
                      <span>Кошик</span>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-coffee-accent rounded-full flex items-center justify-center">
                        <span className="text-[#1f0a03] font-bold text-xs">3</span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Login Button */}
                  <a href="#signin" className="block w-full text-center py-4 bg-coffee-accent text-coffee-green font-bold rounded-full mb-4">
                    Увійти
                  </a>
                </div>
              </div>
            </div>
            
            {/* Close button in top right */}
            <button 
              className="absolute top-6 right-6 w-12 h-12 bg-coffee-accent rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6 text-coffee-green" />
            </button>
          </div>
        )}
      </header>
    </>
  );
}
