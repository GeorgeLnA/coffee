import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLoading } from "../contexts/LoadingContext";

export type SeasonItem = {
  id: string;
  title: string;
  desc: string;
  image: string;
  hoverImage: string;
  href: string;
  customLabel?: string | null;
  customLabelColor?: string | null;
  customLabelTextColor?: string | null;
  labelImageUrl?: string | null;
};

type SeasonCarouselProps = {
  items: SeasonItem[];
  intervalMs?: number;
};

export default function SeasonCarousel({ items, intervalMs = 3000 }: SeasonCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(1); // Start at 1 (first real item, after cloned last item)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const jumpTimerRef = useRef<number | null>(null);
  const { isLoading } = useLoading();

  // Create infinite loop: [last, ...items, first]
  const extendedItems = items.length > 0 ? [
    items[items.length - 1], // Clone last item at start
    ...items,
    items[0] // Clone first item at end
  ] : [];

  // Start auto-playing when loading finishes
  useEffect(() => {
    if (!isLoading && items.length >= 2) {
      setIsAutoPlaying(true);
    }
  }, [isLoading, items.length]);

  // Handle seamless loop transitions - jump happens AFTER transition completes
  useEffect(() => {
    if (extendedItems.length === 0) return;

    // Clear any existing jump timer
    if (jumpTimerRef.current) {
      clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = null;
    }

    // If at cloned last item (index 0), jump to real last item (index items.length)
    if (currentSlide === 0) {
      // Disable transition, jump immediately, then re-enable after a frame
      setIsTransitioning(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCurrentSlide(items.length);
          setTimeout(() => setIsTransitioning(true), 50);
          jumpTimerRef.current = null;
        });
      });
    }
    // If at cloned first item (index extendedItems.length - 1), jump to real first item (index 1)
    // This happens after smoothly transitioning to what appears as the 4th item
    else if (currentSlide === extendedItems.length - 1) {
      // Wait for CSS transition to complete (500ms), then jump instantly
      jumpTimerRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setCurrentSlide(1);
            setTimeout(() => setIsTransitioning(true), 50);
            jumpTimerRef.current = null;
          });
        });
      }, 500); // Match transition duration
    }

    return () => {
      if (jumpTimerRef.current) {
        clearTimeout(jumpTimerRef.current);
        jumpTimerRef.current = null;
      }
    };
  }, [currentSlide, items.length, extendedItems.length]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || items.length < 2) return;
    
    timerRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => {
        // Allow transition to cloned item (last index), then useEffect will handle the jump
        const next = prev + 1;
        return next >= extendedItems.length ? extendedItems.length - 1 : next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, items.length, intervalMs, extendedItems.length]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
      if (jumpTimerRef.current) window.clearTimeout(jumpTimerRef.current);
    };
  }, []);

  // Resume auto-play after user interaction
  const resumeAutoPlay = () => {
    setIsAutoPlaying(false);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      setIsAutoPlaying(true);
    }, 2000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      // Allow transition to cloned item (last index), then useEffect will handle the jump
      const next = prev + 1;
      return next >= extendedItems.length ? extendedItems.length - 1 : next;
    });
    resumeAutoPlay();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev - 1 <= 0) {
        return extendedItems.length - 1; // Will trigger jump to end
      }
      return prev - 1;
    });
    resumeAutoPlay();
  };

  const goToSlide = (index: number) => {
    // Map dot index (0 to items.length-1) to carousel index (1 to items.length)
    setCurrentSlide(index + 1);
    resumeAutoPlay();
  };

  if (items.length === 0) return null;

  // Get actual slide index for dots (0 to items.length-1)
  const actualSlideIndex = currentSlide === 0 
    ? items.length - 1 
    : currentSlide === extendedItems.length - 1 
    ? 0 
    : currentSlide - 1;

  return (
    <div className="md:hidden relative">
      <div className="relative overflow-hidden">
        <div
          className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {extendedItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="w-full flex-shrink-0 px-4">
              <Link to={item.href} className="group block">
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
                    <div className="absolute top-2 right-2 z-10" style={{ width: 'clamp(120px, 30%, 250px)' }}>
                      <img src={item.labelImageUrl} alt="label" className="w-full h-auto" />
                    </div>
                  )}
                  
                  {/* Custom Label Text (if no image and has text) */}
                  {!item.labelImageUrl && item.customLabel && (
                    <div className="absolute left-4 top-4 z-10">
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
                index === actualSlideIndex ? 'bg-[#fcf4e4]' : 'bg-[#fcf4e4]/30 hover:bg-[#fcf4e4]/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}


