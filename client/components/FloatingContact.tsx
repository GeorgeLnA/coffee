import { Mail, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative">
        {/* Contact options */}
        <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          {/* Email */}
          <div className="w-8 h-8 bg-coffee-green rounded-full flex items-center justify-center transform rotate-12 hover:scale-110 transition-transform cursor-pointer" title="Email us">
            <Mail className="w-4 h-4 text-coffee-text-primary transform -rotate-12" />
          </div>
          
          {/* Telegram */}
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center transform -rotate-30 hover:scale-110 transition-transform cursor-pointer" title="Telegram">
            <svg className="w-4 h-4 text-coffee-text-primary transform rotate-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
            </svg>
          </div>
          
          {/* Viber */}
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center transform -rotate-70 hover:scale-110 transition-transform cursor-pointer" title="Viber">
            <svg className="w-4 h-4 text-coffee-text-primary transform rotate-70" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2M8.53 7.33c.16 0 .3.06.43.18c.14.14.35.52.37.56c.02.04.04.09.04.14c0 .12-.1.23-.21.34c-.10.10-.2.21-.29.3c-.09.09-.2.19-.06.37c.14.17.64 1.07 1.39 1.73c.96.85 1.78 1.11 2.03 1.23c.25.12.39.10.54-.06c.15-.16.66-.77.83-.98c.17-.21.35-.17.59-.11c.24.06 1.52.72 1.78.85c.26.13.43.19.49.30c.06.11.06.64-.14 1.25c-.20.61-1.03 1.19-1.56 1.19c-.53 0-1.31.09-1.31.09c-.53 0-1.57-.21-2.89-.82c-1.32-.61-2.28-1.81-2.35-1.89c-.07-.08-.57-.76-.57-1.45c0-.69.36-1.02.49-1.16c.13-.14.29-.17.38-.17z"/>
            </svg>
          </div>
          
          {/* Phone */}
          <div className="w-8 h-8 bg-coffee-green rounded-full flex items-center justify-center transform -rotate-110 hover:scale-110 transition-transform cursor-pointer" title="Call us">
            <Phone className="w-4 h-4 text-coffee-text-primary transform rotate-110" />
          </div>
        </div>

        {/* Main chat button */}
        <div 
          className="w-16 h-16 bg-coffee-accent rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:bg-white hover:scale-110 transition-all duration-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MessageCircle className="w-8 h-8 text-coffee-green" />
        </div>
      </div>
    </div>
  );
}
