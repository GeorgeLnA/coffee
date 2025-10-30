import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#361c0c' }}>
      <div className="text-center px-6">
        <h1 className="font-black tracking-wider" style={{ color: '#ffffff', fontSize: '18rem', lineHeight: 1 }}>404</h1>
        <p className="text-white/90 text-xl mb-8">Сторінку не знайдено</p>
        <Link to="/" className="inline-block px-6 py-3 border-2 font-black hover:bg-white hover:text-[#361c0c] transition-all duration-300" style={{ color: '#ffffff', borderColor: '#ffffff' }}>
          На головну
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
