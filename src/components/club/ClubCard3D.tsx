import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import cardFront from '../../assets/club-card-front.png';
import cardBack from '../../assets/club-card-back.png';

interface ClubCard3DProps {
  interactive?: boolean;
  allowFlipOnClick?: boolean;
  showFlipButton?: boolean;
  className?: string;
  maxTilt?: number;
  initialSide?: 'front' | 'back';
}

/**
 * Performance notes:
 * - Touch: no continuous Framer idle 3D (that caused scroll jank). Static card + CSS flip.
 * - Desktop: pointer tilt + glare only while hovered; springs rest when idle.
 * - Heavy blur / mix-blend disabled on touch during scroll.
 * - Flip uses a single compositor transform; will-change cleared after.
 */
export default function ClubCard3D({
  interactive = true,
  allowFlipOnClick = true,
  showFlipButton = true,
  className = '',
  maxTilt = 10,
  initialSide = 'front',
}: ClubCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(initialSide === 'back');
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touchMq = window.matchMedia('(hover: none), (pointer: coarse)');

    const sync = () => {
      setReduceMotion(motionMq.matches);
      setIsTouch(touchMq.matches);
    };
    sync();

    motionMq.addEventListener('change', sync);
    touchMq.addEventListener('change', sync);
    return () => {
      motionMq.removeEventListener('change', sync);
      touchMq.removeEventListener('change', sync);
    };
  }, []);

  // Pause all interactive work when off-screen (home scroll)
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '80px 0px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, []);

  const pointerTilt = interactive && !reduceMotion && !isTouch && isInView && isHovered;

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 28, stiffness: 180, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-maxTilt, maxTilt]);

  const glareBackground = useTransform(
    [smoothMouseX, smoothMouseY],
    ([x, y]) => {
      const gx = `${Number(x) * 100}%`;
      const gy = `${Number(y) * 100}%`;
      return `radial-gradient(circle 340px at ${gx} ${gy}, rgba(255, 235, 190, 0.26) 0%, rgba(212, 175, 106, 0.08) 40%, transparent 70%)`;
    }
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || isTouch || reduceMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(Math.max(0, Math.min(1, x)));
      mouseY.set(Math.max(0, Math.min(1, y)));
    },
    [interactive, isTouch, reduceMotion, mouseX, mouseY]
  );

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setIsHovered(false);
      mouseX.set(0.5);
      mouseY.set(0.5);
    }
  };

  const toggleFlip = () => {
    if (reduceMotion) {
      setIsFlipped((prev) => !prev);
      return;
    }

    setIsFlipping(true);
    setIsFlipped((prev) => !prev);

    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    flipTimerRef.current = setTimeout(() => {
      setIsFlipping(false);
    }, isTouch ? 520 : 620);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (!allowFlipOnClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFlip();
    }
  };

  const flipDuration = reduceMotion ? 0 : isTouch ? 0.5 : 0.6;

  return (
    <div
      ref={rootRef}
      className={`flex flex-col items-center select-none ${className}`}
    >
      <div
        className="relative w-full max-w-[560px] aspect-[1.586/1] sm:aspect-[1.618/1]"
        style={{ perspective: isTouch ? 1000 : 1200 }}
      >
        {/* Soft radial only — no CSS blur filter on touch (expensive while scrolling) */}
        <div
          className="absolute -inset-3 sm:-inset-8 rounded-[36px] pointer-events-none"
          style={{
            background: isTouch
              ? 'radial-gradient(ellipse at 50% 55%, rgba(178, 133, 88, 0.18) 0%, transparent 68%)'
              : 'radial-gradient(ellipse at 50% 50%, rgba(178, 133, 88, 0.22) 0%, rgba(44, 14, 17, 0.35) 55%, transparent 75%)',
            opacity: isInView ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          aria-hidden="true"
        />

        <motion.div
          ref={cardRef}
          role={allowFlipOnClick ? 'button' : undefined}
          tabIndex={allowFlipOnClick ? 0 : undefined}
          aria-label={
            allowFlipOnClick
              ? isFlipped
                ? 'Show Cardinal Arthur Club card front'
                : 'Flip Cardinal Arthur Club card to back'
              : 'Cardinal Arthur Club membership card'
          }
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={allowFlipOnClick ? toggleFlip : undefined}
          onKeyDown={handleCardKeyDown}
          style={
            pointerTilt
              ? {
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                }
              : {
                  transformStyle: 'preserve-3d',
                }
          }
          animate={
            !isTouch && isHovered && !reduceMotion ? { y: -5 } : { y: 0 }
          }
          transition={{ y: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
          className="relative w-full h-full cursor-pointer touch-manipulation rounded-[18px] sm:rounded-[26px] md:rounded-[30px] p-[1.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B28558]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent [-webkit-tap-highlight-color:transparent]"
        >
          <div
            className="relative w-full h-full rounded-[17px] sm:rounded-[25px] md:rounded-[29px] overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              // Single lightweight shadow on touch — multi-layer shadows + glow thrash GPU on flip
              boxShadow: isTouch
                ? '0 18px 40px -12px rgba(0,0,0,0.75)'
                : isHovered
                  ? '0 28px 56px -14px rgba(0,0,0,0.88), 0 16px 32px -10px rgba(44,14,17,0.55)'
                  : '0 22px 48px -14px rgba(0,0,0,0.8), 0 12px 24px -10px rgba(44,14,17,0.4)',
            }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{
                duration: flipDuration,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                willChange: isFlipping ? 'transform' : 'auto',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* FRONT */}
              <div
                className="absolute inset-0 w-full h-full rounded-[17px] sm:rounded-[25px] md:rounded-[29px] overflow-hidden bg-[#240508]"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0.5px)',
                }}
              >
                <img
                  src={cardFront}
                  alt="Cardinal Arthur Club Membership Card — Front"
                  className="w-full h-full object-cover object-center pointer-events-none select-none"
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />

                {/* Desktop glare only while hovering — avoids continuous style updates */}
                {!isTouch && isHovered && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: glareBackground,
                      opacity: 0.85,
                      mixBlendMode: 'screen',
                    }}
                    aria-hidden="true"
                  />
                )}

                <div
                  className="absolute inset-0 rounded-[17px] sm:rounded-[25px] md:rounded-[29px] pointer-events-none border border-white/15"
                  aria-hidden="true"
                />
              </div>

              {/* BACK — eager load so first flip never stalls decoding a 1MB+ PNG */}
              <div
                className="absolute inset-0 w-full h-full rounded-[17px] sm:rounded-[25px] md:rounded-[29px] overflow-hidden bg-[#240508]"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg) translateZ(0.5px)',
                }}
              >
                <img
                  src={cardBack}
                  alt="Cardinal Arthur Club Membership Card — Back"
                  className="w-full h-full object-cover object-center pointer-events-none select-none"
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  fetchPriority="low"
                />

                <div
                  className="absolute inset-0 rounded-[17px] sm:rounded-[25px] md:rounded-[29px] pointer-events-none border border-white/15"
                  aria-hidden="true"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {showFlipButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFlip();
          }}
          className="mt-6 sm:mt-8 min-h-[44px] inline-flex items-center justify-center group cursor-pointer bg-transparent border-0 px-3 touch-manipulation [-webkit-tap-highlight-color:transparent]"
        >
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.12em] font-light text-white pb-1 border-b border-white/70 group-active:opacity-80 transition-opacity duration-150">
            {isFlipped ? 'View front' : 'Reveal reverse'}
          </span>
        </button>
      )}
    </div>
  );
}
