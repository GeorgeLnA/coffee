import { Search, ShoppingCart, Menu, X, Coffee, Heart } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          ? 'bg-[#1f0a03] shadow-2xl' 
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
                <span className="text-white font-bold text-lg tracking-wide hover:text-coffee-accent transition-all duration-300">
                  Кава
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coffee-accent group-hover:w-full transition-all duration-300"></div>
              </a>
              <a href="#drinks" className="group relative">
                <span className="text-white font-bold text-lg tracking-wide hover:text-coffee-accent transition-all duration-300">
                  Напої
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coffee-accent group-hover:w-full transition-all duration-300"></div>
              </a>
              <a href="#cooperation" className="group relative">
                <span className="text-white font-bold text-lg tracking-wide hover:text-coffee-accent transition-all duration-300">
                  Співпраця
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coffee-accent group-hover:w-full transition-all duration-300"></div>
              </a>
            </nav>

            {/* Right Side - Bold Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Language Switcher - Bold */}
              <div className="flex items-center space-x-1 bg-black/20 rounded-full p-1">
                <button className="px-4 py-2 text-white font-bold text-sm rounded-full bg-coffee-accent transition-all duration-300">
                  UA
                </button>
                <button className="px-4 py-2 text-white font-bold text-sm rounded-full hover:bg-white/10 transition-all duration-300">
                  RU
                </button>
              </div>

              {/* Search - Bold Icon */}
              <button className="p-3 bg-coffee-accent rounded-full hover:bg-coffee-accent/80 transition-all duration-300 group">
                <Search className="w-5 h-5 text-[#1f0a03] group-hover:scale-110 transition-transform" />
              </button>

              {/* Sign In - Bold Button */}
              <a href="#signin" className="px-6 py-3 bg-transparent border-2 border-coffee-accent text-coffee-accent font-bold rounded-full hover:bg-coffee-accent hover:text-[#1f0a03] transition-all duration-300">
                Увійти
              </a>

              {/* Cart - Bold with Badge */}
              <button className="relative p-3 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 group">
                <ShoppingCart className="w-6 h-6 text-[#1f0a03] group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-coffee-accent rounded-full flex items-center justify-center">
                  <span className="text-[#1f0a03] font-bold text-xs">3</span>
                </div>
              </button>
            </div>

            {/* Mobile Menu Button - Bold */}
            <button 
              className="lg:hidden p-3 bg-coffee-accent rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#1f0a03]" />
              ) : (
                <Menu className="w-6 h-6 text-[#1f0a03]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Bold & Full Screen */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            {/* Top half with brown background */}
            <div className="bg-[#1f0a03] pt-20 pb-8">
              <div className="px-6 py-8 space-y-8">
              <nav className="space-y-6">
                <a href="#coffee" className="block text-white font-bold text-2xl hover:text-coffee-accent transition-colors">
                  Кава
                </a>
                <a href="#drinks" className="block text-white font-bold text-2xl hover:text-coffee-accent transition-colors">
                  Напої
                </a>
                <a href="#cooperation" className="block text-white font-bold text-2xl hover:text-coffee-accent transition-colors">
                  Співпраця
                </a>
              </nav>
                
                <div className="pt-8 border-t border-coffee-accent/30">
                  <div className="flex space-x-4 mb-6">
                    <button className="px-4 py-2 bg-coffee-accent text-[#1f0a03] font-bold rounded-full">
                      UA
                    </button>
                    <button className="px-4 py-2 text-white font-bold rounded-full border border-coffee-accent">
                      RU
                    </button>
                  </div>
                  
                  <a href="#signin" className="block w-full text-center py-4 bg-coffee-accent text-[#1f0a03] font-bold rounded-full mb-4">
                    Увійти
                  </a>
                </div>
              </div>
            </div>
            
            {/* Bottom half - transparent overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
              {/* Close button in top right */}
              <button 
                className="absolute top-6 right-6 w-12 h-12 bg-coffee-accent rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 z-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6 text-[#1f0a03]" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
