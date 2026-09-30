import React, { useRef } from 'react';
import { motion, type Variants, useScroll, useTransform } from 'framer-motion';
import aboutImg from '../../assets/aboutpage1.webp';
import AboutPhilosophySection from '../../components/sections/AboutPhilosophySection';
import AboutTimelineSection from '../../components/sections/AboutTimelineSection';
import AboutVisionSection from '../../components/sections/AboutVisionSection';
import AboutFoundersSection from '../../components/sections/AboutFoundersSection';
import AboutSocialsSection from '../../components/sections/AboutSocialsSection';
import FAQSection from '../../components/sections/FAQSection';

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

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

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

      <div ref={containerRef} className="relative w-full min-h-screen bg-[#06114f] overflow-hidden flex items-center justify-center">
        {/* Scroll Parallax Wrapper */}
        <motion.div 
          className="absolute inset-0 w-full h-[120%] -top-[10%] origin-top"
          style={{ y, scale: scrollScale }}
        >
          {/* Background Image Entrance Animation */}
          <motion.div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${aboutImg})` }}
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
            {"ABOUT".split("").map((letter, i) => (
              <motion.span key={i} variants={letterVariants} className="inline-block">
                {letter}
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

      <AboutPhilosophySection />
      <AboutTimelineSection />
      <AboutVisionSection />
      <AboutFoundersSection />
      <AboutSocialsSection />
      <FAQSection />
    </>
  );
}


