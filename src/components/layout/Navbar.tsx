import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import SpecularButton from '../SpecularButton';
import { useCartStore } from '../../store/cartStore';
import { useSplashStore } from '../../store/splashStore';

export default function Navbar() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { openCart, items } = useCartStore();
  const isSplashVisible = useSplashStore(state => state.isSplashVisible);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine if the current page has a light background
  const isLightPage = false; // All pages are now dark

  useEffect(() => {
    if (!isSplashVisible) {
      // Sync with the HeroSection animation delay (1.5s after splash lifts)
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSplashVisible]);

  // Define text colors based on the page background
  const linkTextColor = isLightPage ? 'text-black/70 hover:text-primary' : 'text-white/80 hover:text-primary';
  
  const buttonBaseColor = isLightPage ? '#1a1a1a' : '#52525b';
  const buttonTextColor = isLightPage ? '#1a1a1a' : '#ffffff';
  const buttonLineColor = isLightPage ? 'rgba(0,0,0,0.08)' : '#ffffff';
  const buttonGradient = isLightPage 
    ? '!bg-[#1a1a1a]/[0.06] hover:!bg-[#1a1a1a]/[0.10] !text-[#1a1a1a] border border-black/10 shadow-none backdrop-blur-sm'
    : '!bg-gradient-to-br !from-white/10 !via-transparent !to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:!from-white/15 hover:!via-white/5 hover:!to-white/10';

  return (
    <div 
      className={`absolute top-0 left-0 w-full z-50 px-12 py-4 flex items-center justify-between bg-transparent transition-all duration-[1500ms] ease-out transform ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      }`}
    >
      {/* Left side: Logo */}
      <Link to="/" className="flex items-center group h-[68px] -translate-y-1.5">
        <img 
          src="/logo-removebg-preview.png" 
          alt="Logo" 
          className="h-[68px] w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
        />
      </Link>

      {/* Center: Links */}
      <nav className="hidden md:flex items-center gap-10">
        <Link to="/" className={`relative group ${linkTextColor} text-xs tracking-wide font-medium uppercase transition-colors duration-300 py-1`}>
          Home
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center transform-gpu will-change-transform backface-hidden"></span>
        </Link>
        <Link to="/marketplace" className={`relative group ${linkTextColor} text-xs tracking-wide font-medium uppercase transition-colors duration-300 py-1`}>
          Marketplace
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center transform-gpu will-change-transform backface-hidden"></span>
        </Link>
        <Link to="/about" onClick={() => window.scrollTo(0,0)} className={`relative group ${linkTextColor} text-xs tracking-wide font-medium uppercase transition-colors duration-300 py-1`}>
          Our Story
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center transform-gpu will-change-transform backface-hidden"></span>
        </Link>
        <Link to="/cant-find-it" onClick={() => window.scrollTo(0,0)} className={`relative group ${linkTextColor} text-xs tracking-wide font-medium uppercase transition-colors duration-300 py-1`}>
          Community
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center transform-gpu will-change-transform backface-hidden"></span>
        </Link>
      </nav>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div onClick={openCart}>
            <SpecularButton 
              size="md"
              radius={14}
              tintOpacity={0}
              blur={12}
              baseColor={buttonBaseColor}
              textColor={buttonTextColor}
              lineColor={buttonLineColor}
              className={`!p-[14px] text-xs tracking-wide font-medium uppercase transition-all duration-300 pointer-events-auto ${buttonGradient}`}
            >
              <div className="flex items-center justify-center pointer-events-none">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </SpecularButton>
          </div>
          <span className="absolute -top-2 -right-2 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-black text-[11px] font-heading font-medium shadow-md pointer-events-none z-10">
            {items.length}
          </span>
        </div>
        <a 
          href="#letstalk"
          onClick={(e) => {
            e.preventDefault();
            if (location.pathname === '/') {
              document.querySelector('#letstalk')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              navigate('/', { state: { scrollTo: 'letstalk' } });
            }
          }}
        >
          <SpecularButton 
            size="md"
            radius={14}
            tintOpacity={0}
            blur={12}
            baseColor={buttonBaseColor}
            textColor={buttonTextColor}
            lineColor={buttonLineColor}
            className={`text-xs tracking-wide font-medium uppercase transition-all duration-300 ${buttonGradient}`}
          >
            Let's Talk
          </SpecularButton>
        </a>
      </div>
    </div>
  );
}
