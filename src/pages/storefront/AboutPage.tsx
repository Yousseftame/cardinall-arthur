import { useRef } from 'react';
import { motion, type Variants, useScroll, useTransform } from 'framer-motion';
import aboutImg from '../../assets/aboutpage1.webp';
import PageTransition from '../../components/layout/PageTransition';
import AboutSection from '../../components/sections/AboutSection';
import AboutPhilosophySection from '../../components/sections/AboutPhilosophySection';

// import WorkProcessSection from '../../components/sections/WorkProcessSection';
import AboutTimelineSection from '../../components/sections/AboutTimelineSection';
import AboutVisionSection from '../../components/sections/AboutVisionSection';

import AboutSocialsSection from '../../components/sections/AboutSocialsSection';
import FAQSection from '../../components/sections/FAQSection';

const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.25,
    },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
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
      <PageTransition />

      {/* Hero Section */}
      <div ref={containerRef} className="relative w-full min-h-screen bg-[#06114f] overflow-hidden flex items-center justify-center">
        {/* Scroll Parallax Wrapper */}
        <motion.div 
          className="absolute inset-0 w-full h-[115%] -top-[7%] origin-top pointer-events-none transform-gpu will-change-transform"
          style={{ y, scale: scrollScale }}
        >
          {/* Hardware-Accelerated Hero Image */}
          <motion.img 
            src={aboutImg} 
            alt="About Hero" 
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center select-none transform-gpu will-change-transform"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
          />
        </motion.div>
        
        {/* Original Electric Blue Overlays */}
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

          </motion.h1>
        </div>
      </div>

      {/* First content section: same FAFAFA → near-black fade + grain as home Products */}
      <div className="site-atmosphere site-atmosphere--fade">
        <AboutSection />
      </div>

      <div className="site-atmosphere site-atmosphere--deep">
        <AboutPhilosophySection />
        {/* <WorkProcessSection /> */}
        <AboutTimelineSection />
        <AboutVisionSection />
        {/* <AboutFoundersSection /> */}
        <AboutSocialsSection />
        <FAQSection />
      </div>
    </>
  );
}


