import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, User, Search } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { useSplashStore } from '../../store/splashStore';

export default function Navbar() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { openCart, items } = useCartStore();
  const { openMenu } = useMenuStore();
  const isSplashVisible = useSplashStore(state => state.isSplashVisible);
  
  const location = useLocation();

  
  useEffect(() => {
    if (!isSplashVisible) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSplashVisible]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div 
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-[1200ms] ease-[0.16,1,0.3,1] transform ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-[150%]'
      }`}
    >
      <div 
        className={`relative flex items-center justify-between px-5 md:px-12 py-2.5 md:py-3.5 transition-all duration-500 ease-out backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.8)] ${
          isScrolled 
            ? 'bg-black/95 w-[100vw] md:w-[85vw] lg:w-[75vw]' 
            : 'bg-black/90 w-[100vw] md:w-[95vw] lg:w-[85vw]'
        }`}
        style={{
          // Scaled angled edges for both mobile and desktop
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 16px) 100%, 16px 100%)'
        }}
      >
        {/* Elegant Bottom Line (Double layered for a sleek glowing center) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>

        {/* Left: Menu */}
        <button onClick={openMenu} className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 text-white/80 hover:text-white transition-colors group z-10">
          <div className="relative flex flex-col justify-center gap-[4px] md:gap-[5px] w-4 h-4 md:w-5 md:h-5">
            <span className="w-full h-[1.5px] bg-current block transition-all duration-300 transform origin-right"></span>
            <span className="w-[60%] h-[1.5px] bg-current block transition-all duration-300 group-hover:w-full"></span>
          </div>
          <span className="inline-block font-heading text-[10px] sm:text-[11px] md:text-xs tracking-[0.25em] uppercase font-medium mt-0.5">Menu</span>
        </button>

        {/* Center: Name with Logo Between */}
        <Link 
          to="/" 
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              // Ensures the click registers completely before triggering the smooth scroll
              requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
            } else {
              window.scrollTo(0,0);
            }
          }} 
          className="flex items-center gap-1.5 md:gap-3 group absolute left-1/2 -translate-x-1/2 w-max z-10 cursor-pointer"
        >
          <span className="font-heading text-[10px] sm:text-xs md:text-lg font-light tracking-tighter uppercase text-white whitespace-nowrap mt-0.5 md:mt-1">
            Cardinal
          </span>
          <img 
            src="/logo-removebg-preview.png" 
            alt="Logo" 
            className="h-6 sm:h-7 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-heading text-[10px] sm:text-xs md:text-lg font-light tracking-tighter uppercase text-white whitespace-nowrap mt-0.5 md:mt-1">
            Arthur
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-3 z-10">
          <button className="p-1.5 md:p-2 text-white/80 hover:text-white transition-colors group">
            <Search className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
          </button>

          <Link to="/auth/login" className="block p-1.5 md:p-2 text-white/80 hover:text-white transition-colors group">
            <User className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
          </Link>
          
          <div className="relative p-1.5 md:p-2 text-white/80 hover:text-white transition-colors cursor-pointer group" onClick={openCart}>
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
            <span className="absolute top-0 md:top-1 right-0 flex h-[14px] w-[14px] md:h-[16px] md:w-[16px] items-center justify-center rounded-full bg-white text-black text-[8px] md:text-[9px] font-bold shadow-md pointer-events-none transition-transform group-hover:scale-110">
              {items.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
