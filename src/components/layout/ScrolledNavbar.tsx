import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, Search, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { useSearchStore } from '../../store/searchStore';
import { useFavoriteStore } from '../../store/favoriteStore';

export default function ScrolledNavbar() {
  const [isVisible, setIsVisible] = useState(false);
  const { openCart, items } = useCartStore();
  const { openMenu } = useMenuStore();
  const { openSearch } = useSearchStore();
  const { items: favoriteItems } = useFavoriteStore();

  useEffect(() => {
    const handleScroll = () => {
      // Show this navbar after scrolling past most of the hero section
      if (window.scrollY > window.innerHeight * 0.9) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Navbar */}
      <div 
        className={`fixed top-0 left-0 w-full z-40 bg-gradient-to-br from-white/10 via-white/30 to-white/80 backdrop-blur-2xl border-b border-white/40 shadow-sm transition-transform duration-500 ease-[0.22,1,0.36,1] ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="px-6 md:px-12 py-4 flex items-center justify-between">
          
          {/* Left: Menu Toggle */}
          <button 
            onClick={openMenu}
            className="flex items-center gap-3 group"
          >
            <Menu className="w-6 h-6 text-[#1a1a1a] stroke-[2]" />
            <span className="hidden md:inline-block font-medium uppercase tracking-[0.25em] text-[11px] text-[#1a1a1a] group-hover:text-primary transition-colors">
              Menu
            </span>
          </button>

          {/* Center: Minimal Typography Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={scrollToTop}>
            <h1 className="font-heading text-lg md:text-xl tracking-[0.15em] uppercase text-[#1a1a1a] font-light tracking-tighter">
              Cardinal Arthur
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 md:gap-3 z-10">
            <button onClick={openSearch} className="p-1.5 md:p-2 text-[#1a1a1a] hover:text-primary transition-colors group">
              <Search className="w-5 h-5 md:w-6 md:h-6 stroke-[2] transition-transform group-hover:scale-110" />
            </button>
            <Link to="/favorites" className="relative p-1.5 md:p-2 text-[#1a1a1a] hover:text-primary transition-colors group">
              <Heart className="w-5 h-5 md:w-6 md:h-6 stroke-[2] transition-transform group-hover:scale-110" />
              <span className="absolute -top-1.5 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2C0E11] text-[10px] font-sans font-semibold leading-none pt-[1px] text-[#f8f7f3] shadow-md group-hover:bg-primary transition-colors">
                {favoriteItems.length}
              </span>
            </Link>
            <div className="relative cursor-pointer group flex items-center justify-center p-2 -mr-2" onClick={openCart}>
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-[#1a1a1a] stroke-[2] group-hover:text-primary transition-colors" />
                <span className="absolute -top-1.5 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2C0E11] text-[10px] font-sans font-semibold leading-none pt-[1px] text-[#f8f7f3] shadow-md group-hover:bg-primary transition-colors">
                  {items.length}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
