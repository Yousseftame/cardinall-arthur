import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, type Variants, useScroll, useTransform } from 'framer-motion';
import { DiaTextReveal } from '../../components/ui/dia-text-reveal';
import marketplace2 from '../../assets/marketplace2.webp';
import banner2 from '../../assets/banner2.webp';
import marketplaceImg from '../../assets/marketplace1.webp';

const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.9,
    },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 100, filter: 'blur(12px)', scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const BANNERS = [
  {
    id: 1,
    image: marketplace2,
    pill: 'Cardinal Arthur',
    title: ['CARDINAL', 'ARTHUR', 'COLLECTION'],
    subtitle: 'Crafted with exquisite intention. The absolute finest selection of our heritage legacy. Welcome to the Marketplace.',
  },
  {
    id: 2,
    image: banner2,
    pill: 'New Arrivals',
    title: ['AUTUMN', 'WINTER', 'ESSENTIALS'],
    subtitle: 'Discover the dark elegance of the new season. Perfectly tailored for those who dare to lead.',
  }
];

const CATEGORIES = ['ALL', 'NEW ARRIVAL', 'MENS', 'WOMENS', 'WINTER'];

import { Link } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import FAQSection from '../../components/sections/FAQSection';

export default function MarketplacePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  // Auto-advance banner every 5 seconds, resets on manual interaction
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <>
      {/* Page Transition Overlays */}
      <motion.div
        className="fixed inset-0 z-[80] bg-black"
        initial={{ y: 0 }}
        animate={{ y: '-100%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
      />
      <motion.div
        className="fixed inset-0 z-[70] bg-[#B28558]"
        initial={{ y: 0 }}
        animate={{ y: '-100%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
      />
      <motion.div
        className="fixed inset-0 z-[60] bg-black"
        initial={{ y: 0 }}
        animate={{ y: '-100%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
      />

      {/* Hero Section */}
      <div ref={containerRef} className="relative w-full min-h-screen bg-[#06114f] overflow-hidden flex items-center justify-center">
        {/* Scroll Parallax Wrapper */}
        <motion.div 
          className="absolute inset-0 w-full h-[120%] -top-[10%] origin-top"
          style={{ y, scale: scrollScale }}
        >
          {/* Background Image Entrance Animation */}
          <motion.div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${marketplaceImg})` }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.6 }}
          />
        </motion.div>
        
        {/* Blue overlay */}
        <div className="absolute inset-0 bg-[#071871]/40 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply pointer-events-none" />

        {/* Main Text Content */}
        <div className="relative z-10 w-full px-4 flex justify-center items-center">
          <motion.h1 
            className="text-[18vw] md:text-[220px] leading-none text-white flex items-center justify-center font-heading font-medium tracking-tight whitespace-nowrap overflow-hidden py-4"
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {"SHOP".split("").map((letter, i) => (
              <motion.span key={i} variants={letterVariants} className="inline-block">
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
            <motion.span variants={letterVariants} className="ml-1 md:ml-4 flex items-center justify-center relative translate-y-[2%] inline-block">
              <svg viewBox="0 0 100 100" className="w-[0.8em] h-[0.8em]" fill="none" stroke="currentColor" strokeWidth="5">
                <circle cx="50" cy="50" r="44" />
                <path d="M64,32 A 22,22 0 1,0 64,68" />
              </svg>
            </motion.span>
          </motion.h1>
        </div>
      </div>

      <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-20 overflow-x-hidden text-white">
      
      {/* 1. Banner Carousel Section */}
      <section className="px-4 md:px-8 w-full max-w-[1920px] mx-auto mb-20 mt-4">
        <div 
          className="relative w-full h-[50vh] min-h-[400px] md:h-[500px] lg:h-[550px] rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col items-center justify-center border border-white/10 shadow-2xl"
        >
          <AnimatePresence>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full transform-gpu"
              style={{ willChange: 'opacity, transform' }}
            >
              {/* Background Image */}
              <img 
                src={BANNERS[currentIndex].image} 
                alt="Banner Background" 
                className="absolute inset-0 w-full h-full object-cover object-center transform-gpu"
                loading="eager"
              />
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

              {/* Top Pill / Branding */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="absolute top-6 left-6 md:top-8 md:left-8 bg-[#0a0a0a]/80 border border-white/10 rounded-full px-5 py-2 md:px-6 md:py-2.5 shadow-xl flex items-center justify-center transform-gpu"
              >
                <span className="font-heading font-bold text-white text-sm md:text-lg tracking-wider uppercase mt-0.5">
                  {BANNERS[currentIndex].pill}
                </span>
              </motion.div>

              {/* Main Typography */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-4 transform -skew-x-[12deg] pointer-events-none">
                <h1 
                  className="font-heading font-black text-white uppercase text-5xl md:text-7xl lg:text-[84px] xl:text-[96px] leading-[0.85] tracking-tight flex flex-col items-center scale-x-105"
                  style={{ textShadow: "0 10px 20px rgba(0,0,0,0.6)" }}
                >
                  {BANNERS[currentIndex].title.map((line, i) => (
                    <motion.span 
                      key={i}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="transform-gpu"
                      style={{ willChange: 'opacity, transform' }}
                    >
                      {line}
                    </motion.span>
                  ))}
                </h1>
              </div>

              {/* Subtitle */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute bottom-10 md:bottom-12 left-0 right-0 z-10 px-4 flex justify-center pointer-events-none transform-gpu"
                style={{ willChange: 'opacity, transform' }}
              >
                <p className="text-white/80 font-light text-sm md:text-base lg:text-lg max-w-xl text-center drop-shadow-lg" style={{ fontFamily: '"Outfit", sans-serif' }}>
                  {BANNERS[currentIndex].subtitle}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`transition-all duration-500 rounded-full ${
                  i === currentIndex ? 'w-8 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 2. Products Section */}
      <section className="px-4 md:px-12 w-full max-w-[1920px] mx-auto">
        <div className="flex flex-col mb-6 mt-12 md:mt-16">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-[56px] font-light tracking-tighter uppercase mb-8">
            <DiaTextReveal 
              text="THE COLLECTION" 
              textColor="#ffffff" 
              colors={["#ffffff", "#ffffff", "transparent"]} 
            />
          </h2>
          
          {/* Category Filter */}
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto scrollbar-hide w-full" style={{ fontFamily: '"Outfit", sans-serif' }}>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-sm md:text-base uppercase transition-colors whitespace-nowrap tracking-wide ${
                  activeCategory === category 
                    ? 'text-white font-bold' 
                    : 'text-white/40 font-medium hover:text-white/70'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-10">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.08 }}
            >
            <Link to={`/product/${product.id}`} className="flex flex-col group cursor-pointer relative h-full">
              
              {/* Image Container with Badge */}
              <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden mb-5 w-full group/image flex items-center justify-center">
                {/* Primary Image */}
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-contain p-6 md:p-8 transition-opacity duration-500 ease-in-out group-hover/image:opacity-0"
                />
                {/* Hover Image */}
                <img 
                  src={product.hoverImage} 
                  alt={`${product.name} alternate`} 
                  className="absolute inset-0 w-full h-full object-contain p-6 md:p-8 opacity-0 transition-opacity duration-500 ease-in-out group-hover/image:opacity-100"
                />
                
                {/* Price Badge Nestled Inside Top Right */}
                <div className="absolute top-3 right-4 bg-[#0a0a0a] text-white w-16 h-16 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center z-10">
                  <span 
                    className="font-semibold text-[11px] md:text-[13px] tracking-wide text-center leading-tight whitespace-nowrap flex items-center gap-[3px]"
                    style={{ fontFamily: '"Outfit", sans-serif' }}
                  >
                    <span>{product.price.replace('LE ', '')}</span>
                    <span>EGP</span>
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col px-1 flex-grow">
                <h3 
                  className="font-medium text-lg md:text-xl text-white mb-1.5 group-hover:text-white/60 transition-colors line-clamp-2" 
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  {product.name}
                </h3>
                <p 
                  className="text-white/60 text-sm leading-relaxed line-clamp-3" 
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  {product.desc}
                </p>
              </div>

            </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <FAQSection />

    </div>
    </>
  );
}
