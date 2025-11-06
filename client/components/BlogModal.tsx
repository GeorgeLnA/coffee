import { X, Calendar, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
  } | null;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function BlogModal({
  isOpen,
  onClose,
  article,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: BlogModalProps) {
  const { t, language } = useLanguage();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Parse markdown content and render with proper SEO structure
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;
    let inList = false;
    let listItems: JSX.Element[] = [];

    const flushList = () => {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={key++} className="list-disc list-inside mb-4 space-y-2 ml-4">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        flushList();
        continue;
      }

      // H2 headings (##)
      if (line.startsWith('## ')) {
        flushList();
        const headingText = line.replace('## ', '');
        elements.push(
          <h2 key={key++} className="text-2xl font-black mt-8 mb-4 font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>
            {headingText}
          </h2>
        );
      }
      // Checkmark (✅)
      else if (line.startsWith('✅ ')) {
        flushList();
        const summaryText = line.replace('✅ ', '');
        elements.push(
          <h3 key={key++} className="text-xl font-black mt-6 mb-3 font-coolvetica" style={{ color: '#361c0c' }}>
            {summaryText}
          </h3>
        );
      }
      // Bullet points (-)
      else if (line.startsWith('- ')) {
        inList = true;
        const listText = line.replace('- ', '');
        listItems.push(
          <li key={listItems.length} className="mb-2">
            {listText}
          </li>
        );
      }
      // Regular paragraphs
      else {
        flushList();
        // Check for links to coffee page (multiple variations)
        const coffeeLinkMatch = line.match(/Купити свіжообсмажену каву|Купить свежообжаренный кофе|Купити свіжообсмажену каву в Києві|Купить свежообжаренный кофе в Киеве|купити каву онлайн|купить кофе онлайн|Купити каву з доставкою|Купить кофе с доставкой|купити каву онлайн Київ|купить кофе онлайн Киев|Купити каву в зернах|Купить кофе в зёрнах|купити каву в зернах Україна|купить кофе в зёрнах Украина|Купити спешіалті каву|Купить спешиалти кофе/);
        if (coffeeLinkMatch) {
          const beforeLink = line.substring(0, line.indexOf(coffeeLinkMatch[0]));
          const linkText = coffeeLinkMatch[0];
          const afterLink = line.substring(line.indexOf(coffeeLinkMatch[0]) + linkText.length);
          
          elements.push(
            <p key={key++} className="mb-4 text-base sm:text-lg leading-relaxed">
              {beforeLink}
              <Link 
                to="/coffee" 
                className="font-bold underline hover:no-underline transition-all"
                style={{ color: '#361c0c' }}
              >
                {linkText}
              </Link>
              {afterLink}
            </p>
          );
        } else {
          elements.push(
            <p key={key++} className="mb-4 text-base sm:text-lg leading-relaxed">
              {line}
            </p>
          );
        }
      }
    }
    
    flushList(); // Flush any remaining list items

    return elements;
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-lg shadow-2xl" style={{ backgroundColor: '#fcf4e4' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b-2" style={{ borderColor: '#361c0c' }}>
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Navigation Arrows */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={onPrevious}
                disabled={!hasPrevious}
                className={`p-1 sm:p-2 rounded-lg transition-all duration-300 ${
                  hasPrevious 
                    ? 'hover:bg-[#361c0c] hover:text-[#fcf4e4]' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ color: '#361c0c' }}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={onNext}
                disabled={!hasNext}
                className={`p-1 sm:p-2 rounded-lg transition-all duration-300 ${
                  hasNext 
                    ? 'hover:bg-[#361c0c] hover:text-[#fcf4e4]' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ color: '#361c0c' }}
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            {/* Category Badge */}
            <span className="px-2 sm:px-4 py-1 sm:py-2 text-[#fcf4e4] font-black text-xs sm:text-sm rounded-lg truncate" style={{ backgroundColor: '#361c0c' }}>
              {article.category}
            </span>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1 sm:p-2 rounded-lg hover:bg-[#361c0c] hover:text-[#fcf4e4] transition-all duration-300 flex-shrink-0"
            style={{ color: '#361c0c' }}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-80px)]">
          {/* Article Image */}
          <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
            <img 
              src={article.image} 
              alt={article.title}
              title={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Article Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6 leading-tight font-coolvetica tracking-wider" style={{ color: '#361c0c' }}>
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2" style={{ borderColor: '#361c0c' }}>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div className="flex items-center space-x-2" style={{ color: '#361c0c' }}>
                  <Calendar className="w-4 h-4" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center space-x-2" style={{ color: '#361c0c' }}>
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime}</span>
                </div>
                <div className="flex items-center space-x-2" style={{ color: '#361c0c' }}>
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{article.author}</span>
                  <span className="sm:hidden">TCM</span>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <article className="prose prose-sm sm:prose-base md:prose-lg max-w-none" style={{ color: '#361c0c' }}>
              <p className="text-lg sm:text-xl font-medium leading-relaxed mb-6 sm:mb-8">
                {article.excerpt}
              </p>
              <div className="text-base sm:text-lg leading-relaxed">
                {renderContent(article.content)}
              </div>
              
              {/* CTA Link to Coffee Page */}
              <div className="mt-8 pt-6 border-t-2" style={{ borderColor: '#361c0c' }}>
                <Link 
                  to="/coffee"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#361c0c] text-[#fcf4e4] font-black text-lg hover:bg-[#4a2817] transition-all duration-300"
                >
                  <span>{language === 'ru' ? 'Купить свежообжаренный кофе' : 'Купити свіжообсмажену каву'}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </article>
          </div>
        </div>

      </div>
    </div>
  );
}
