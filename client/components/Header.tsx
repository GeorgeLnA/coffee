import { Search, ShoppingCart, Menu, X, Coffee, Heart, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSecondHeaderVisible, setIsSecondHeaderVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  
  // Check if we're on the main landing page
  const isMainPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50; // First header appears after first scroll
      const secondHeaderVisible = window.scrollY > 250; // Second header appears after 5th scroll
      setIsScrolled(scrolled);
      setIsSecondHeaderVisible(secondHeaderVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ backgroundColor: isMainPage ? (isScrolled ? '#3b0b0b' : 'transparent') : '#3b0b0b' }}
      >
        <div className="w-full h-full">
        <div className="w-full px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left Side - Page Navigation Only */}
            <div className="flex items-center">
              {/* Desktop Navigation - Clean & Minimalistic */}
              <nav className="hidden lg:flex items-center space-x-12">
              <Link to="/coffee" className="group relative">
                <span className="text-white font-medium text-lg tracking-wide hover:text-white/80 transition-all duration-300">
                  {t('nav.coffee')}
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#fcf4e4' }}></div>
              </Link>
              <a href="#water" className="group relative">
                <span className="text-white font-medium text-lg tracking-wide hover:text-white/80 transition-all duration-300">
                  {t('nav.water')}
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#fcf4e4' }}></div>
              </a>
              <a href="#drinks" className="group relative">
                <span className="text-white font-medium text-lg tracking-wide hover:text-white/80 transition-all duration-300">
                  {t('nav.drinks')}
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#fcf4e4' }}></div>
              </a>
              
              {/* Dropdown Menu */}
              <div className="relative group">
                <button 
                  className="flex items-center space-x-1 text-white font-medium text-lg tracking-wide hover:text-white/80 transition-all duration-300"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <span>{t('nav.more')}</span>
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>
              </nav>
            </div>

            {/* Logo - Centered on Desktop, Left on Mobile */}
            <div className="absolute left-4 lg:left-1/2 lg:transform lg:-translate-x-1/2 z-50">
              <Link to="/" className="group">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src="/manifest-site-logo.png" 
                      alt="THE COFFEE Manifest" 
                      className="h-12 w-auto transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Side - Actions */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Language Switcher - Clean */}
              <div className="flex items-center space-x-1 p-1" style={{ backgroundColor: '#fcf4e4' + '20' }}>
                <button 
                  className="px-4 py-2 font-bold text-sm transition-all duration-300" 
                  style={{ color: language === 'ua' ? '#3b0b0b' : '#fcf4e4', backgroundColor: language === 'ua' ? '#fcf4e4' : 'transparent' }}
                  onClick={() => setLanguage('ua')}
                >
                  UA
                </button>
                <button 
                  className="px-4 py-2 font-bold text-sm transition-all duration-300" 
                  style={{ color: language === 'ru' ? '#3b0b0b' : '#fcf4e4', backgroundColor: language === 'ru' ? '#fcf4e4' : 'transparent' }}
                  onClick={() => setLanguage('ru')}
                >
                  RU
                </button>
              </div>

              {/* Search - Clean Icon */}
              {/* Sign In - Clean Button */}
              <a href="#signin" className="px-6 py-3 bg-transparent border-2 border-[#fcf4e4] font-bold text-[#fcf4e4] hover:bg-[#fcf4e4] hover:text-[#3b0b0b] transition-all duration-300">
                {t('auth.signin')}
              </a>

              {/* Cart - Clean with Badge */}
              <button className="relative p-3 transition-all duration-300 group" style={{ backgroundColor: '#fcf4e4' + '20' }}>
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: '#fcf4e4' }} />
                <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#fcf4e4' }}>
                  <span className="font-bold text-xs" style={{ color: '#3b0b0b' }}>3</span>
                </div>
              </button>
            </div>

            {/* Mobile Header Actions */}
            <div className="lg:hidden flex items-center space-x-4">
              {/* Mobile Language Switcher */}
              <div className="flex items-center space-x-1 p-1" style={{ backgroundColor: '#fcf4e4' + '20' }}>
                <button 
                  className="px-3 py-2 font-bold text-sm transition-all duration-300" 
                  style={{ color: language === 'ua' ? '#3b0b0b' : '#fcf4e4', backgroundColor: language === 'ua' ? '#fcf4e4' : 'transparent' }}
                  onClick={() => setLanguage('ua')}
                >
                  UA
                </button>
                <button 
                  className="px-3 py-2 font-bold text-sm transition-all duration-300" 
                  style={{ color: language === 'ru' ? '#3b0b0b' : '#fcf4e4', backgroundColor: language === 'ru' ? '#fcf4e4' : 'transparent' }}
                  onClick={() => setLanguage('ru')}
                >
                  RU
                </button>
              </div>
              
              {/* Mobile Menu Button - Clean */}
              <button 
                className="p-3 transition-all duration-300"
                style={{ backgroundColor: '#fcf4e4' + '20' }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" style={{ color: '#fcf4e4' }} />
                ) : (
                  <Menu className="w-6 h-6" style={{ color: '#fcf4e4' }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Clean Slide Implementation */}
        <div className={`lg:hidden fixed inset-0 z-40 pointer-events-none ${isMobileMenuOpen ? 'pointer-events-auto' : ''}`}>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/50 transition-opacity duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          {/* Mobile menu slides from right full screen */}
          <div className={`fixed top-0 right-0 h-full w-full transform transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: '#3b0b0b' }}>
              <div className="px-6 pt-24 pb-8 space-y-8">
              <nav className="space-y-6">
                <Link to="/coffee" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.coffee')}
                </Link>
                <a href="#water" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.water')}
                </a>
                <a href="#drinks" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.drinks')}
                </a>
                <a href="#about" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.about')}
                </a>
                <a href="#contacts" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                  {t('nav.contacts')}
                </a>
                
                {/* Additional Menu Items - Show/Hide */}
                {isMobileDropdownOpen && (
                  <>
                    <a href="#cooperation" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                      {t('nav.cooperation')}
                    </a>
                    <a href="#coffee-machines" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                      {t('nav.coffee-machines')}
                    </a>
                    <a href="#privacy-policy" className="block text-white font-bold text-2xl hover:text-white/80 transition-colors">
                      {t('nav.privacy-policy')}
                    </a>
                  </>
                )}
                
                {/* More Button */}
                <button 
                  className="flex items-center space-x-2 text-white font-bold text-2xl hover:text-white/80 transition-colors"
                  onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                >
                  <span>{isMobileDropdownOpen ? t('mobile.less') : t('mobile.more')}</span>
                  <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </nav>
                
                <div className="pt-8 border-t border-white/20">
                  {/* Basket Button */}
                  <div className="mb-6">
                    <button className="relative w-full flex items-center justify-center space-x-2 py-4 font-bold hover:bg-[#fcf4e4] hover:text-[#3b0b0b] transition-all duration-300" style={{ backgroundColor: '#fcf4e4' + '20', color: '#fcf4e4' }}>
                      <ShoppingCart className="w-5 h-5" />
                      <span>{t('mobile.cart')}</span>
                      <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#fcf4e4' }}>
                        <span className="font-bold text-xs" style={{ color: '#3b0b0b' }}>3</span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Login Button */}
                  <a href="#signin" className="block w-full text-center py-4 font-bold mb-4 bg-transparent border-2 border-[#fcf4e4] text-[#fcf4e4] hover:bg-[#fcf4e4] hover:text-[#3b0b0b] transition-all duration-300">
                    {t('auth.signin')}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Close button in top right of sliding panel */}
            <button 
              className={`absolute top-6 right-6 w-12 h-12 flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{ backgroundColor: '#fcf4e4' + '20' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" style={{ color: '#fcf4e4' }} />
            </button>
          </div>
        </div>

      </header>

      {/* Desktop Dropdown Bar - Slides from Under Header */}
      <div
        className={`fixed left-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDropdownOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          backgroundColor: isMainPage ? (isSecondHeaderVisible ? '#3b0b0b' : 'transparent') : '#3b0b0b', 
          top: '80px' 
        }}
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        <div className="px-4 lg:px-8">
          <div className="flex items-center h-20">
            {/* Additional Navigation - Left Aligned */}
            <div className="flex items-center space-x-12">
              <a href="#about" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {t('nav.about')}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </a>
              <a href="#contacts" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {t('nav.contacts')}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </a>
              <a href="#cooperation" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {t('nav.cooperation')}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </a>
              <a href="#coffee-machines" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {t('nav.coffee-machines')}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </a>
              <a href="#privacy-policy" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {t('nav.privacy-policy')}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </a>
              <a href="#news" className="group relative">
                 <span className={`font-medium text-lg tracking-wide transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'text-white hover:text-white/80' : 'text-transparent'
                 }`}>
                  {t('nav.news')}
                </span>
                 <div className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                   isSecondHeaderVisible || isDropdownOpen ? 'bg-[#fcf4e4]' : 'bg-transparent'
                 }`}></div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
