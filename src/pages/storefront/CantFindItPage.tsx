import { useRef } from 'react';
import { motion, type Variants, useScroll, useTransform } from 'framer-motion';
import { DiaTextReveal } from '../../components/ui/dia-text-reveal';
import SpecularButton from '../../components/SpecularButton';
import communityImg from '../../assets/community1.webp';
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function CantFindItPage() {
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
            style={{ backgroundImage: `url(${communityImg})` }}
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
            {"SAY HI".split("").map((letter, i) => (
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

      {/* Main Content Form */}
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-24 md:pt-40 flex items-center overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 xl:gap-32 items-center">
          
          {/* Left Side: Typography */}
          <div className="flex flex-col gap-10 z-10">
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl xl:text-[100px] font-bold uppercase tracking-tight leading-[0.85]">
              <DiaTextReveal 
                text="COMMUNITY" 
                textColor="#ffffff" 
                colors={["#ffffff", "#ffffff", "transparent"]}
                duration={1.5}
                delay={0.2}
                once={true}
              />
              <br/>
              <DiaTextReveal 
                text="REQUESTS" 
                textColor="#ffffff" 
                colors={["#ffffff", "#ffffff", "transparent"]}
                duration={1.5}
                delay={0.4}
                once={true}
              />
            </h1>
            <p 
              className="text-xl md:text-2xl font-medium leading-relaxed max-w-lg text-white/70"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              Can't find your perfect scent? Share the notes you desire or the designer inspiration you're looking for, and let us craft it for you.
            </p>
          </div>

          {/* Right Side: Form */}
          <div className="flex flex-col justify-center w-full">
            <motion.form 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              className="flex flex-col gap-10 md:gap-14 w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mt-8 lg:mt-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
                <motion.div variants={itemVariants} className="relative group">
                  <input 
                    type="text" 
                    placeholder="Your Name*" 
                    required
                    className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg"
                    style={{ fontFamily: '"Outfit", sans-serif' }}
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="relative group">
                  <input 
                    type="email" 
                    placeholder="Your Email*" 
                    required
                    className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg"
                    style={{ fontFamily: '"Outfit", sans-serif' }}
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="relative group">
                <input 
                  type="text" 
                  placeholder="Desired Notes (e.g. Vanilla, Bergamot, Oud)*" 
                  required
                  className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <input 
                  type="text" 
                  placeholder="Designer Inspiration (Optional)" 
                  className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <textarea 
                  placeholder="Additional Details or Story Behind the Request*" 
                  required
                  rows={3}
                  className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg resize-y"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                ></textarea>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <SpecularButton 
                  type="submit"
                  size="md"
                  radius={14}
                  tintOpacity={0}
                  blur={12}
                  baseColor="#52525b"
                  className="!px-7 !py-3 md:!px-8 md:!py-3.5 text-xs tracking-wide font-medium uppercase !bg-gradient-to-br !from-white/10 !via-transparent !to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:!from-white/15 hover:!via-white/5 hover:!to-white/10 transition-all duration-300 w-fit"
                >
                  <div className="flex items-center justify-center gap-2.5 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    Submit Request
                  </div>
                </SpecularButton>
              </motion.div>
            </motion.form>
          </div>
          
        </div>
      </div>

      <FAQSection />
    </>
  );
}
