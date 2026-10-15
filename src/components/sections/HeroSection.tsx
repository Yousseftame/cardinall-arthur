import { useState, useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import heroBg from '../../assets/hero-bg.avif';
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
/** Calmer expand — less snap than expo-out */
const EASE_EXPAND = [0.4, 0, 0.2, 1] as const;

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
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
          duration: 1.25,
          opacity: { delay: 0.95, duration: 0.85, ease: 'easeOut' },
          scale: { delay: 0.95, duration: 1.25, ease: EASE_ARRIVE },
        },
      });
      if (cancelled) return;

      // Navbar enters once the image is on screen (before full expand)
      useSplashStore.getState().setHeroIntroComplete(true);

      await imageControls.start({
        scale: 1,
        transition: {
          delay: 0.4,
          duration: 1.85,
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
        style={{ fontFamily: "'Inter Tight', sans-serif" }}
        className="relative z-10 text-white text-[8.2vw] sm:text-[10vw] md:text-[10vw] lg:text-[9vw] font-medium tracking-[0.04em] md:tracking-[0.06em] text-center uppercase px-3 md:px-4 leading-none flex items-center justify-center max-w-full"
        aria-label={TEXT}
      >
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            className="inline-block overflow-hidden"
            style={{ width: char === ' ' ? '0.35em' : undefined }}
            aria-hidden="true"
          >
            <motion.span
              className="inline-block will-change-transform"
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
