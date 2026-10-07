import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Search } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { useSearchStore } from '../../store/searchStore';
import { useSplashStore } from '../../store/splashStore';
import { useFavoriteStore } from '../../store/favoriteStore';

export default function Navbar() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { openCart, items } = useCartStore();
  const { openMenu } = useMenuStore();
  const { openSearch } = useSearchStore();
  const isSplashVisible = useSplashStore(state => state.isSplashVisible);
  const { items: favoriteItems } = useFavoriteStore();
  
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
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-[1200ms] ease-[0.16,1,0.3,1] transform w-full px-4 sm:px-6 md:px-8 mt-4 md:mt-6 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-[150%]'
      }`}
    >
      <div 
        className={`relative flex items-center justify-between mx-auto px-5 md:px-8 py-3 transition-all duration-500 ease-out backdrop-blur-[24px] backdrop-saturate-[180%] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.08)] border border-white/40 rounded-full overflow-hidden bg-gradient-to-b from-white/70 via-white/40 to-white/20 ${
          isScrolled 
            ? 'w-[95%] md:w-[75vw] lg:w-[60vw]' 
            : 'w-[100%] md:w-[85vw] lg:w-[70vw]'
        }`}
      >

        {/* Left: Menu */}
        <button onClick={openMenu} className="flex items-center gap-2 md:gap-2.5 p-1.5 md:p-2 text-[#1a1a1a]/80 hover:text-[#1a1a1a] transition-colors group z-10">
          <div className="flex flex-col justify-center items-start gap-[5px] md:gap-[6px] w-[18px] md:w-[20px]">
            <span className="w-full h-[2px] bg-current rounded-full transition-all duration-500 ease-[0.16,1,0.3,1] group-hover:w-[60%]"></span>
            <span className="w-[60%] h-[2px] bg-current rounded-full transition-all duration-500 ease-[0.16,1,0.3,1] group-hover:w-full"></span>
          </div>
          <span className="inline-block font-heading text-[10.5px] sm:text-[11px] md:text-xs tracking-[0.2em] uppercase font-medium mt-0.5">Menu</span>
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
            }
          }} 
          className="flex items-center gap-1.5 md:gap-3 group absolute left-1/2 -translate-x-1/2 w-max z-10 cursor-pointer"
        >
          <span style={{ fontFamily: "'Pinyon Script', cursive" }} className="text-[18px] sm:text-[20px] md:text-[28px] text-black whitespace-nowrap mt-0.5 md:mt-1 drop-shadow-sm">
            Cardinal
          </span>
          <img 
            src="/logo-removebg-preview.png" 
            alt="Logo" 
            className="h-[30px] sm:h-[34px] md:h-[42px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span style={{ fontFamily: "'Pinyon Script', cursive" }} className="text-[18px] sm:text-[20px] md:text-[28px] text-black whitespace-nowrap mt-0.5 md:mt-1 drop-shadow-sm">
            Arthur
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-3 z-10">
          <button onClick={openSearch} className="p-1.5 md:p-2 text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors group">
            <Search className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
          </button>

          <Link to="/favorites" className="relative block p-1.5 md:p-2 text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors group">
            <Heart className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
            <span className="absolute top-0 md:top-1 right-0 flex h-[14px] w-[14px] md:h-[16px] md:w-[16px] items-center justify-center rounded-full bg-[#1a1a1a] text-white text-[9px] font-sans font-semibold leading-none pt-[1px] shadow-md pointer-events-none transition-transform group-hover:scale-110">
              {favoriteItems.length}
            </span>
          </Link>
          
          <div className="relative p-1.5 md:p-2 text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors cursor-pointer group" onClick={openCart}>
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
            <span className="absolute top-0 md:top-1 right-0 flex h-[14px] w-[14px] md:h-[16px] md:w-[16px] items-center justify-center rounded-full bg-[#1a1a1a] text-white text-[9px] font-sans font-semibold leading-none pt-[1px] shadow-md pointer-events-none transition-transform group-hover:scale-110">
              {items.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
