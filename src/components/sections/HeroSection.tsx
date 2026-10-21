import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import heroBg from '../../assets/hero-bg.avif';
import titleBg from '../../assets/breaksection.webp';
import { useSplashStore } from '../../store/splashStore';

const TEXT = 'CARDINAL ARTHUR';
/** Beat of empty stage after splash curtain lifts */
const INTRO_DELAY_MS = 400;

/**
 * Matches kitpro-jenna.webflow.io hero text:
 * splitText chars + mask:"chars", x: -150px → 0, duration 1s, stagger 0.08s
 */
const LETTER_DURATION = 1;
const LETTER_STAGGER = 0.08;
const LETTER_FROM_X = -150;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Soft settle into the mid frame */
const EASE_ARRIVE = [0.22, 1, 0.36, 1] as const;
/** Cinematic expand to full */
const EASE_EXPAND = [0.19, 1, 0.22, 1] as const;

interface LetterBackground {
  backgroundSize: string;
  backgroundPosition: string;
}

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const charWrapRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [titleImageSize, setTitleImageSize] = useState<{ w: number; h: number } | null>(null);
  const [letterBackgrounds, setLetterBackgrounds] = useState<LetterBackground[] | null>(null);
  const imageControls = useAnimationControls();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileHeight, setMobileHeight] = useState<number | null>(null);
  const isSplashVisible = useSplashStore((s) => s.isSplashVisible);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const checkMobile = () => {
      const currentWidth = window.innerWidth;
      const mobile = currentWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setMobileHeight((prev) =>
          prev === null || currentWidth !== lastWidth
            ? Math.round(window.innerHeight * 0.82)
            : prev
        );
      } else {
        setMobileHeight(null);
      }
      lastWidth = currentWidth;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load title image so its real aspect ratio can be preserved in the letters
  useEffect(() => {
    const img = new Image();
    img.src = titleBg;
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setTitleImageSize({ w: img.naturalWidth, h: img.naturalHeight });
      }
    };
  }, []);

  // Fit the image across the whole title (cover, no stretching), then slice
  // that exact fit per letter by the letter's measured position in the title.
  const measureLetterBackgrounds = useCallback(() => {
    const title = titleRef.current;
    if (!title || !titleImageSize) return;

    const titleRect = title.getBoundingClientRect();
    if (titleRect.width <= 0 || titleRect.height <= 0) return;

    const scale = Math.max(
      titleRect.width / titleImageSize.w,
      titleRect.height / titleImageSize.h
    );
    const imgW = titleImageSize.w * scale;
    const imgH = titleImageSize.h * scale;
    const originX = (titleRect.width - imgW) / 2;
    const originY = (titleRect.height - imgH) / 2;

    const next: LetterBackground[] = TEXT.split('').map((_, i) => {
      const el = charWrapRefs.current[i];
      if (!el) {
        return {
          backgroundSize: `${imgW}px ${imgH}px`,
          backgroundPosition: `${originX}px ${originY}px`,
        };
      }
      const rect = el.getBoundingClientRect();
      return {
        backgroundSize: `${imgW}px ${imgH}px`,
        backgroundPosition: `${originX - (rect.left - titleRect.left)}px ${originY - (rect.top - titleRect.top)}px`,
      };
    });

    setLetterBackgrounds((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    );
  }, [titleImageSize]);

  useLayoutEffect(() => {
    measureLetterBackgrounds();
  }, [measureLetterBackgrounds]);

  useEffect(() => {
    measureLetterBackgrounds();
    window.addEventListener('resize', measureLetterBackgrounds);
    document.fonts?.ready.then(() => measureLetterBackgrounds()).catch(() => {});
    return () => window.removeEventListener('resize', measureLetterBackgrounds);
  }, [measureLetterBackgrounds]);

  useEffect(() => {
    if (isSplashVisible) {
      setReveal(false);
      return;
    }
    const t = setTimeout(() => setReveal(true), INTRO_DELAY_MS);
    return () => clearTimeout(t);
  }, [isSplashVisible]);

  // Two-phase image: far → mid frame → full, with a short hold between
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!reveal) {
        imageControls.set({ opacity: 0, scale: 0.05 });
        useSplashStore.getState().setHeroIntroComplete(false);
        return;
      }

      imageControls.set({ opacity: 0, scale: 0.05 });

      await imageControls.start({
        opacity: 1,
        scale: 0.32,
        transition: {
          delay: 0.95,
          duration: 0.65,
          opacity: { delay: 0.95, duration: 0.45, ease: 'easeOut' },
          scale: { delay: 0.95, duration: 0.65, ease: EASE_ARRIVE },
        },
      });
      if (cancelled) return;

      // Navbar enters once the image is on screen (before full expand)
      useSplashStore.getState().setHeroIntroComplete(true);

      await imageControls.start({
        scale: 1,
        transition: {
          delay: 0.06,
          duration: 0.8,
          ease: EASE_EXPAND,
        },
      });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reveal, imageControls]);

  const chars = TEXT.split('');

  return (
    <section
      ref={containerRef}
      style={{ height: isMobile && mobileHeight ? `${mobileHeight}px` : undefined }}
      className="relative h-[82svh] md:h-[100dvh] w-full overflow-hidden bg-black flex items-center justify-center"
    >
      {/*
        Image stage (Jenna): black → tiny center → mid hold → full viewport
      */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0 origin-center transform-gpu will-change-transform"
          initial={{ opacity: 0, scale: 0.05 }}
          animate={imageControls}
        >
          <img
            src={heroBg}
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
            draggable={false}
          />
        </motion.div>
      </div>

      {/* Brand title — Jenna: masked chars slide from left */}
      <h1
        ref={titleRef}
        style={{
          fontFamily: "'Bodoni Moda', 'Playfair Display', serif",
          fontOpticalSizing: 'auto',
          filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.45))',
        }}
        className="relative z-10 text-[8.2vw] sm:text-[10vw] md:text-[10vw] lg:text-[9vw] font-bold tracking-[0.04em] md:tracking-[0.06em] text-center uppercase px-3 md:px-4 leading-none flex items-center justify-center max-w-full"
        aria-label={TEXT}
      >
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            ref={(el) => {
              charWrapRefs.current[i] = el;
            }}
            className="inline-block overflow-hidden"
            style={{ width: char === ' ' ? '0.35em' : undefined }}
            aria-hidden="true"
          >
            <motion.span
              className="inline-block will-change-transform"
              style={{
                // Image fills each letter (hero background is untouched),
                // fitted across the whole title — aspect preserved, never stretched.
                backgroundImage: `url(${titleBg})`,
                ...(letterBackgrounds?.[i] ?? {
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }),
                backgroundRepeat: 'no-repeat',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
              initial={false}
              animate={reveal ? { x: 0 } : { x: LETTER_FROM_X }}
              transition={{
                duration: LETTER_DURATION,
                delay: reveal ? 0.05 + i * LETTER_STAGGER : 0,
                ease: EASE,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          </span>
        ))}
      </h1>
    </section>
  );
}
