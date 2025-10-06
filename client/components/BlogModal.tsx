import { X, Calendar, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";
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
  const { t } = useLanguage();

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
              className="w-full h-full object-cover"
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
            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none" style={{ color: '#361c0c' }}>
              <p className="text-lg sm:text-xl font-medium leading-relaxed mb-4 sm:mb-6">
                {article.excerpt}
              </p>
              <div className="text-base sm:text-lg leading-relaxed space-y-3 sm:space-y-4">
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 sm:mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
