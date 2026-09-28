import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import SpecularButton from '../SpecularButton';
import { useCartStore } from '../../store/cartStore';

export default function Navbar() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { openCart, items } = useCartStore();

  useEffect(() => {
    // Sync with the HeroSection animation delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`absolute top-0 left-0 w-full z-50 px-12 py-4 flex items-center justify-between bg-transparent transition-all duration-[1500ms] ease-out transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
    >
      {/* Left side: Logo */}
      <Link to="/" className="flex items-center group h-[68px] -translate-y-1.5">
        <img 
          src="/logo-removebg-preview.png" 
          alt="Logo" 
          className="h-[68px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Center: Links */}
      <nav className="hidden md:flex items-center gap-10">
        <Link to="#about" className="relative group text-white/80 hover:text-white text-xs tracking-wide font-medium uppercase transition-colors duration-300 py-1">
          About
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
        </Link>
        <Link to="#service" className="relative group text-white/80 hover:text-white text-xs tracking-wide font-medium uppercase transition-colors duration-300 py-1">
          Service
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
        </Link>
        <Link to="#portfolio" className="relative group text-white/80 hover:text-white text-xs tracking-wide font-medium uppercase transition-colors duration-300 py-1">
          Portfolio
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
        </Link>
        <Link to="#testimonials" className="relative group text-white/80 hover:text-white text-xs tracking-wide font-medium uppercase transition-colors duration-300 py-1">
          Testimonials
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
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
              baseColor="#52525b"
              className="!p-[14px] text-xs tracking-wide font-medium uppercase !bg-gradient-to-br !from-white/10 !via-transparent !to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:!from-white/15 hover:!via-white/5 hover:!to-white/10 transition-all duration-300 pointer-events-auto"
            >
              <div className="flex items-center justify-center pointer-events-none">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </SpecularButton>
          </div>
          <span className="absolute -top-2 -right-2 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[11px] font-heading font-medium text-black shadow-md pointer-events-none z-10">
            {items.length}
          </span>
        </div>
        <Link to="#contact">
          <SpecularButton 
            size="md"
            radius={14}
            tintOpacity={0}
            blur={12}
            baseColor="#52525b"
            className="text-xs tracking-wide font-medium uppercase !bg-gradient-to-br !from-white/10 !via-transparent !to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:!from-white/15 hover:!via-white/5 hover:!to-white/10 transition-all duration-300"
          >
            Contact
          </SpecularButton>
        </Link>
      </div>
    </div>
  );
}
