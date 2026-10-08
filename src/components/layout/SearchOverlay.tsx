import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { useSearchStore } from '../../store/searchStore';
import { useNavigate } from 'react-router-dom';

const SUGGESTIONS = [
  "Midnight Duffle",
  "Luxury Handbags",
  "Leather Wallets",
  "Travel Accessories",
  "Evening Clutches"
];

export default function SearchOverlay() {
  const { isOpen, closeSearch } = useSearchStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Slight delay to allow animation to start before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      closeSearch();
      navigate('/marketplace');
      // In a real app, you would pass the search query to the marketplace via state or URL search params
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    closeSearch();
    navigate('/marketplace');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-start pt-[15vh] md:pt-[25vh] px-6 bg-[#2C0E11]/80 backdrop-blur-2xl"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] bg-[#2C0E11]/40 rounded-full blur-[120px] pointer-events-none opacity-60"></div>
          
          <button 
            onClick={closeSearch}
            className="absolute top-8 right-8 md:top-12 md:right-12 text-white/50 hover:text-white transition-colors duration-300 group"
          >
            <X strokeWidth={1} className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-90 transition-transform duration-500 ease-in-out" />
          </button>

          <div className="w-full max-w-4xl relative z-10">
            <motion.form 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSubmit}
              className="relative group"
            >
              <div className="flex items-center">
                <Search strokeWidth={1} className="w-8 h-8 md:w-12 md:h-12 text-white/40 group-focus-within:text-white transition-colors duration-500 absolute left-0" />
                <input 
                  ref={inputRef}
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent border-none outline-none text-white text-3xl md:text-5xl lg:text-7xl font-light tracking-tight pl-12 md:pl-20 pb-4 md:pb-6 placeholder:text-white/20 focus:ring-0"
                />
              </div>
              
              {/* Animated Bottom Border */}
              <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-white/60"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
                <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#2C0E11] to-white/80 origin-left scale-x-0 group-focus-within:scale-x-100 transition-transform duration-700 ease-[0.22,1,0.36,1]"></div>
              </div>
            </motion.form>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 md:mt-16"
            >
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium whitespace-nowrap">Trending Searches</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
              </div>
              <ul className="flex flex-wrap gap-x-8 gap-y-4 md:gap-x-12 md:gap-y-6">
                {SUGGESTIONS.map((suggestion, index) => (
                  <motion.li 
                    key={suggestion}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.05), ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button 
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="group relative flex items-center gap-2 py-1 md:py-2 text-white/50 hover:text-white text-base md:text-xl font-light transition-colors duration-500"
                    >
                      <span className="relative z-10">{suggestion}</span>
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/40 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-[0.22,1,0.36,1]"></span>
                      <ArrowUpRight strokeWidth={1.5} className="w-4 h-4 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 ease-[0.22,1,0.36,1]" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
