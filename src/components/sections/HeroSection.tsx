import { useState, useEffect, useRef } from 'react';
import heroBg from '../../assets/hero-bg.avif';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import { useSplashStore } from '../../store/splashStore';

const INTRO_MS = 1500;
const TAP_RESUME_MS = 800;

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const tapTargetRef = useRef< { x: number; y: number } | null>(null);
  const resumeIdleAtRef = useRef(0);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(true);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [mobileHeight, setMobileHeight] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const isSplashVisible = useSplashStore(state => state.isSplashVisible);
  const [isLoaded, setIsLoaded] = useState(() => !useSplashStore.getState().isSplashVisible);

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const checkMobile = () => {
      const currentWidth = window.innerWidth;
      const mobile = currentWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        // Lock to initial height on mobile; only update if screen width changed (orientation change)
        setMobileHeight(prev => (prev === null || currentWidth !== lastWidth) ? Math.round(window.innerHeight * 0.82) : prev);
      } else {
        setMobileHeight(null);
      }
      lastWidth = currentWidth;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (containerRef.current) {
      const x = containerRef.current.clientWidth / 2;
      const y = containerRef.current.clientHeight / 2;
      posRef.current = { x, y };
      setMousePos({ x, y });
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!isSplashVisible && !isLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSplashVisible, isLoaded]);

  useEffect(() => {
    if (!isMobile || !isLoaded) {
      setMotionReady(false);
      tapTargetRef.current = null;
      return;
    }

    const timer = setTimeout(() => {
      const el = containerRef.current;
      if (el) {
        posRef.current = {
          x: el.clientWidth / 2,
          y: el.clientHeight / 2,
        };
      }
      setMotionReady(true);
    }, INTRO_MS);

    return () => clearTimeout(timer);
  }, [isMobile, isLoaded]);

  useEffect(() => {
    if (!isMobile || !motionReady) return;

    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    const origin = performance.now();

    const loop = (now: number) => {
      if (!visibleRef.current || document.hidden) {
        raf = 0;
        return;
      }

      const w = el.clientWidth;
      const h = el.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const half = 120;
      const tap = tapTargetRef.current;

      if (tap) {
        posRef.current.x += (tap.x - posRef.current.x) * 0.1;
        posRef.current.y += (tap.y - posRef.current.y) * 0.1;
        const dx = tap.x - posRef.current.x;
        const dy = tap.y - posRef.current.y;
        if (dx * dx + dy * dy < 4) {
          posRef.current = { x: tap.x, y: tap.y };
          tapTargetRef.current = null;
          resumeIdleAtRef.current = now + TAP_RESUME_MS;
        }
      } else if (now >= resumeIdleAtRef.current) {
        const t = (now - origin) / 1000;
        const tx = cx + Math.sin(t * 0.32) * w * 0.11;
        const ty = cy + Math.cos(t * 0.24) * h * 0.07;
        posRef.current.x += (tx - posRef.current.x) * 0.04;
        posRef.current.y += (ty - posRef.current.y) * 0.04;
      }

      const { x, y } = posRef.current;
      const left = x - half;
      const top = y - half;
      const clip = `polygon(${left}px ${top}px, ${x + half}px ${top}px, ${x + half}px ${y + half}px, ${left}px ${y + half}px)`;

      if (clipRef.current) clipRef.current.style.clipPath = clip;
      if (frameRef.current) frameRef.current.style.transform = `translate(${left}px, ${top}px)`;

      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) start();
      },
      { threshold: 0.15 }
    );
    io.observe(el);

    const onVisibility = () => {
      if (!document.hidden && visibleRef.current) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isMobile, motionReady]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile || !containerRef.current || !isLoaded) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    if (!isHovered) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isMobile || !isLoaded) return;
    setIsHovered(false);
    if (containerRef.current) {
      setMousePos({
        x: containerRef.current.clientWidth / 2,
        y: containerRef.current.clientHeight / 2,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (!isMobile || !motionReady) return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!isMobile || !motionReady || !containerRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (dx * dx + dy * dy > 100) return;

    const rect = containerRef.current.getBoundingClientRect();
    tapTargetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const baseSquareSize = isMobile ? 240 : 280;
  const currentSquareSize = isLoaded ? baseSquareSize : 4000;
  const halfSize = currentSquareSize / 2;

  const left = mousePos.x - halfSize;
  const right = mousePos.x + halfSize;
  const top = mousePos.y - halfSize;
  const bottom = mousePos.y + halfSize;

  const clipPolygon = `polygon(${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px)`;

  const transitionStyle = {
    transition: isMobile && motionReady
      ? 'none'
      : isHovered
        ? 'clip-path 0.15s ease-out, transform 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out'
        : 'clip-path 1.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1), width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1), height 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ height: isMobile && mobileHeight ? `${mobileHeight}px` : undefined }}
      className="relative h-[82svh] md:h-[100dvh] w-full overflow-hidden bg-[#111] flex items-center justify-center cursor-default touch-pan-y"
    >
      {/* Blurred Background Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
        <img
          src={heroBg}
          alt="Hero Background"
          className={`absolute w-full h-full object-cover object-center opacity-90 scale-[1.05] pointer-events-none transition-[filter,opacity] duration-[1500ms] ease-out ${isLoaded ? 'blur-[8px]' : 'blur-0'}`}
        />
        {/* Dark overlay */}
        <div className={`absolute inset-0 bg-black/30 transition-opacity duration-[1500ms] ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Sharp Image Layer Clipped to Square */}
      <div
        ref={clipRef}
        className="absolute inset-0 w-full h-full z-20 pointer-events-none transform-gpu"
        style={{ clipPath: clipPolygon, willChange: 'clip-path', ...transitionStyle }}
      >
        <img
          src={heroBg}
          alt="Sharp Hero"
          className="absolute w-full h-full object-cover object-center filter brightness-110 contrast-110 grayscale-[20%] pointer-events-none"
        />
      </div>

      {/* Frame and Crosshair (Tracks mouse precisely) */}
      <div
        ref={frameRef}
        className={`absolute left-0 top-0 z-30 pointer-events-none border-[0.5px] border-white/50 flex items-center justify-center transition-opacity duration-[1500ms] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          width: currentSquareSize,
          height: currentSquareSize,
          transform: `translate(${left}px, ${top}px)`,
          ...transitionStyle,
        }}
      >
        <div className="hidden">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/80 mix-blend-overlay">
            <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Floating Text Labels */}
      <div className={`absolute w-full h-full inset-0 px-6 pt-24 pb-10 md:py-0 md:px-12 md:top-[35%] md:h-auto md:-translate-y-1/2 left-0 z-40 pointer-events-none text-white text-[9px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] font-semibold uppercase flex flex-col md:flex-row justify-between items-start md:items-center transition-opacity duration-[1500ms] delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
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
      <div className="absolute bottom-[15%] md:bottom-0 left-0 w-full text-center z-30 pointer-events-none flex justify-center px-4 md:translate-y-[4%]">
        <h1
          style={{ fontFamily: "'Pinyon Script', cursive" }}
          className="text-[13vw] sm:text-[13vw] md:text-[11vw] lg:text-[10.5vw] leading-[0.85] whitespace-nowrap opacity-90 select-none w-full text-center scale-y-[1.05] md:scale-y-[1.15] origin-bottom font-light"
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
