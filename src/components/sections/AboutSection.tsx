import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import img1 from '../../assets/aboutus1.avif';
import img2 from '../../assets/aboutus2.avif';
import img3 from '../../assets/aboutus3.avif';
import img4 from '../../assets/aboutus4.avif';
import {
  DEFAULT_ABOUT_INTRO,
  getAboutIntro,
} from '../../services/aboutIntro.service';

export default function AboutSection() {
  // Fetch only when this section mounts (About page) — not from admin layout
  const { data: intro } = useQuery({
    queryKey: ['about-intro'],
    queryFn: getAboutIntro,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const text = (intro?.description || DEFAULT_ABOUT_INTRO.description).trim();
  const stats = intro?.stats ?? DEFAULT_ABOUT_INTRO.stats;

  const textRef = useRef<HTMLParagraphElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setInView(false);
    const el = textRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  // Pre-calculate letters and their global staggered delay
  let globalIndex = 0;
  const wordElements = text.split(' ').map((word, wIndex) => {
    const charElements = word.split('').map((char, cIndex) => {
      const delay = globalIndex * 0.025;
      globalIndex++;
      return (
        <span
          key={cIndex}
          className={`char-reveal ${inView ? 'active' : ''}`}
          style={{ animationDelay: inView ? delay + 's' : '0s' }}
        >
          {char}
        </span>
      );
    });
    globalIndex++;
    return (
      <span key={wIndex} className="inline-block mr-[0.25em]">
        {charElements}
      </span>
    );
  });

  const galleryRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ['start 90%', 'end 70%'],
  });

  const clip1 = useTransform(scrollYProgress, [0, 0.4], ['inset(30% 0 0 0)', 'inset(0% 0 0 0)']);
  const clip2 = useTransform(scrollYProgress, [0.05, 0.45], ['inset(30% 0 0 0)', 'inset(0% 0 0 0)']);
  const clip3 = useTransform(scrollYProgress, [0.1, 0.5], ['inset(30% 0 0 0)', 'inset(0% 0 0 0)']);
  const clip4 = useTransform(scrollYProgress, [0.15, 0.55], ['inset(30% 0 0 0)', 'inset(0% 0 0 0)']);

  return (
    <section
      id="about"
      className="relative z-10 w-full bg-transparent text-white pt-16 pb-4 md:pt-48 md:pb-12 px-6 md:px-16 lg:px-24 border-t border-white/5 -mt-[1px] -mb-[1px] md:mt-0 md:mb-0"
    >
      <style>
        {`
          @keyframes illuminate {
            0% { color: rgba(255,255,255,0.2); }
            100% { color: rgba(255,255,255,1); }
          }
          .char-reveal {
            color: rgba(255,255,255,0.2);
            transition: color 0.1s;
          }
          .char-reveal.active {
            animation: illuminate 0.8s forwards ease-out;
          }
        `}
      </style>

      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-8 md:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="md:w-[200px] lg:w-[240px] flex-shrink-0"
        >
          <div className="flex items-center gap-1.5 text-[24px] font-heading font-medium tracking-normal uppercase">
            <span className="text-[22px] leading-none mb-0.5">®</span>
            <span>ABOUT</span>
          </div>
        </motion.div>

        <div className="flex-1">
          <p
            ref={textRef}
            className="text-[20px] md:text-[32px] leading-[1.25] md:leading-[1.15] font-serif font-light uppercase tracking-tighter flex flex-wrap"
          >
            {wordElements}
          </p>

          <div className="mt-16 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 justify-items-start">
            {stats.map((stat, i) => (
              <StatItem key={`${stat.label}-${i}`} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </div>

      {/* Pyramid Image Gallery — images unchanged for now */}
      <div ref={galleryRef} className="max-w-[1400px] mx-auto mt-16 md:mt-32 relative z-10">
        <div className="flex items-end gap-4 w-full h-[400px] md:h-[600px]">
          <motion.div style={{ clipPath: clip1 }} className="flex-1 h-full overflow-hidden">
            <img
              src={img1}
              alt="About Us 1"
              className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
            />
          </motion.div>

          <motion.div style={{ clipPath: clip2 }} className="flex-1 h-[75%] overflow-hidden">
            <img
              src={img2}
              alt="About Us 2"
              className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
            />
          </motion.div>

          <motion.div style={{ clipPath: clip3 }} className="flex-1 h-[50%] overflow-hidden">
            <img
              src={img3}
              alt="About Us 3"
              className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
            />
          </motion.div>

          <motion.div style={{ clipPath: clip4 }} className="flex-1 h-[30%] overflow-hidden">
            <img
              src={img4}
              alt="About Us 4"
              className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-start justify-center group">
      <div className="flex items-start mb-2">
        <span className="text-[56px] md:text-[64px] leading-none font-heading font-medium tracking-tight text-white">
          {value}
        </span>
      </div>
      <div className="text-[10px] md:text-[12px] tracking-[0.15em] font-heading font-semibold uppercase text-white/80">
        {label}
      </div>
    </div>
  );
}
