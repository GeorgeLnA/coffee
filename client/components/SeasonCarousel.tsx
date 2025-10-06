import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type SeasonItem = {
  id: string;
  title: string;
  desc: string;
  image: string;
  hoverImage: string;
  href: string;
};

type SeasonCarouselProps = {
  items: SeasonItem[];
  intervalMs?: number;
};

export default function SeasonCarousel({ items, intervalMs = 3000 }: SeasonCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<number | null>(null);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || items.length < 2) return;
    
    timerRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, items.length, intervalMs]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % items.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  if (items.length === 0) return null;

  return (
    <div className="md:hidden relative">
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={`${item.id}-${index}`} className="w-full flex-shrink-0 px-4">
              <Link to={item.href} className="group block">
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-6">
                  <div className="absolute inset-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-700"
                    />
                    <img
                      src={item.hoverImage}
                      alt={item.title}
                      className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    />
                  </div>
                  
                  {/* Navigation Arrows - Inside Image Container */}
                  {items.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          prevSlide();
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm border border-white/10 hover:border-white/30"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          nextSlide();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm border border-white/10 hover:border-white/30"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
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
            </div>
          ))}
        </div>
      </div>


      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-[#fcf4e4]' : 'bg-[#fcf4e4]/30 hover:bg-[#fcf4e4]/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}


