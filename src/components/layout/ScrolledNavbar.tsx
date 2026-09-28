import { useState, useEffect } from 'react';
import { ShoppingBag, Menu } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';

export default function ScrolledNavbar() {
  const [isVisible, setIsVisible] = useState(false);
  const { openCart, items } = useCartStore();
  const { openMenu } = useMenuStore();

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
        className={`fixed top-0 left-0 w-full z-40 bg-[#f8f7f3]/95 backdrop-blur-md border-b border-[#1a1a1a]/5 transition-transform duration-500 ease-[0.22,1,0.36,1] ${
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
            <span className="hidden md:inline-block font-medium uppercase tracking-[0.25em] text-[11px] text-[#1a1a1a] group-hover:text-[#2C0E11] transition-colors">
              Menu
            </span>
          </button>

          {/* Center: Minimal Typography Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={scrollToTop}>
            <h1 className="font-heading text-lg md:text-xl font-medium tracking-[0.15em] uppercase text-[#1a1a1a]">
              Cardinal Arthur
            </h1>
          </div>

          {/* Right: Cart Button (Icon Only, Bold) */}
          <div className="relative cursor-pointer group flex items-center justify-center p-2 -mr-2" onClick={openCart}>
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-[#1a1a1a] stroke-[2] group-hover:text-[#2C0E11] transition-colors" />
              <span className="absolute -top-1.5 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a1a] text-[10px] font-medium text-[#f8f7f3] shadow-md group-hover:bg-[#2C0E11] transition-colors">
                {items.length}
              </span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
