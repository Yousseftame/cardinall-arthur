import { useState, useEffect, useRef } from 'react';
import heroBg from '../../assets/hero-bg.avif';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import { useSplashStore } from '../../store/splashStore';

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isSplashVisible = useSplashStore(state => state.isSplashVisible);

  useEffect(() => {
    AOS.init({ once: true });
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (containerRef.current) {
      setMousePos({
        x: containerRef.current.clientWidth / 2,
        y: containerRef.current.clientHeight / 2,
      });
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!isSplashVisible) {
      // Wait 1.5 seconds after splash begins fading before starting Hero animations
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSplashVisible]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current || !isLoaded) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    if (!isHovered) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isLoaded) return;
    setIsHovered(false);
    if (containerRef.current) {
      setMousePos({
        x: containerRef.current.clientWidth / 2,
        y: containerRef.current.clientHeight / 2,
      });
    }
  };

  const baseSquareSize = isMobile ? 220 : 280;
  // Start massive (4000px) then shrink down to the base size
  const currentSquareSize = isLoaded ? baseSquareSize : 4000;
  const halfSize = currentSquareSize / 2;

  const left = mousePos.x - halfSize;
  const right = mousePos.x + halfSize;
  const top = mousePos.y - halfSize;
  const bottom = mousePos.y + halfSize;

  const clipPolygon = `polygon(${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px)`;
  
  // Dynamic smooth transition: snappier when tracking, smoother/longer when returning to center or during initial load
  const transitionStyle = { 
    transition: isHovered 
      ? 'clip-path 0.15s ease-out, transform 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out' 
      : 'clip-path 1.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1), width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1), height 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-screen w-full overflow-hidden bg-[#111] flex items-center justify-center cursor-default"
    >
      {/* Blurred Background Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
        <img 
          src={heroBg} 
          alt="Hero Background" 
          className={`absolute w-[100vw] h-[100vh] max-w-none object-cover top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 scale-[1.05] pointer-events-none transition-all duration-[1500ms] ease-out ${isLoaded ? 'blur-[8px]' : 'blur-0'}`} 
        />
        {/* Dark overlay */}
        <div className={`absolute inset-0 bg-black/30 transition-opacity duration-[1500ms] ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Sharp Image Layer Clipped to Square */}
      <div 
        className="absolute inset-0 w-full h-full z-20 pointer-events-none"
        style={{ clipPath: clipPolygon, ...transitionStyle }}
      >
        <img 
          src={heroBg} 
          alt="Sharp Hero" 
          className="absolute w-[100vw] h-[100vh] max-w-none object-cover top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 filter brightness-110 contrast-110 grayscale-[20%] pointer-events-none" 
        />
      </div>

      {/* Frame and Crosshair (Tracks mouse precisely) */}
      <div 
        className={`absolute left-0 top-0 z-30 pointer-events-none border-[0.5px] border-white/50 flex items-center justify-center transition-opacity duration-[1500ms] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          width: currentSquareSize, 
          height: currentSquareSize,
          transform: `translate(${left}px, ${top}px)`,
          ...transitionStyle
        }}
      >
        {/* Only fade in the plus icon after the initial frame shrinking is fully completed */}
        <div className="hidden">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/80 mix-blend-overlay">
            <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Floating Text Labels */}
      <div className={`absolute w-full h-full inset-0 px-6 pt-24 pb-28 md:py-0 md:px-12 md:top-[35%] md:h-auto md:-translate-y-1/2 left-0 z-40 pointer-events-none text-white text-[9px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] font-semibold uppercase flex flex-col md:flex-row justify-between items-start md:items-center transition-opacity duration-[1500ms] delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
         <div className="flex w-full justify-between md:w-auto md:justify-start">
           <div>UI/UX DESIGNER</div>
           <div className="md:hidden">BRAND DESIGNER</div>
         </div>
         <div className="hidden md:block">BRAND DESIGNER</div>
         <div className="hidden md:block">ILLUSTRATOR</div>
         <div className="flex w-full justify-between md:w-auto md:justify-start mt-auto md:mt-0">
           <div className="md:hidden">ILLUSTRATOR</div>
           <div>LA, CALIFORNIA</div>
         </div>
      </div>

      {/* Large Bottom Text */}
      <div className="absolute bottom-[18%] md:bottom-0 left-0 w-full text-center z-30 pointer-events-none flex justify-center px-4 md:translate-y-[4%]">
        <h1 
          className="font-heading text-[9vw] sm:text-[9vw] md:text-[8vw] lg:text-[7.5vw] leading-[0.85] uppercase whitespace-nowrap opacity-90 select-none w-full text-center scale-y-[1.05] md:scale-y-[1.15] origin-bottom font-light tracking-wide"
        >
          {isLoaded && (
            <DiaTextReveal 
              text="Cardinal Arthur" 
              textColor="#ffffff" 
              colors={["#ffffff", "#ffffff", "transparent"]}
              duration={1.8}
              delay={1.5}
              once={true}
            />
          )}
        </h1>
      </div>
    </section>
  );
}
