import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { DiaTextReveal } from '../ui/dia-text-reveal';

export default function WorkProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll progress of this specific section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "center 55%"] 
  });

  // Desktop Elevator Animation mappings
  const yUp = useTransform(scrollYProgress, [0, 1], [350, 0]);
  const yDown = useTransform(scrollYProgress, [0, 1], [-350, 0]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  // Mobile standard animation
  const mobileVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
  };

  return (
    <section ref={sectionRef} className="bg-[#0a0a0a] text-[#f8f7f3] py-32 px-6 md:px-12 lg:px-24">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
        <h2 
          className="font-heading text-6xl md:text-8xl uppercase leading-[0.9] flex flex-col font-light tracking-tighter"
        >
          <DiaTextReveal 
            text="WORK" 
            textColor="#ffffff" 
            colors={["#ffffff", "#ffffff", "transparent"]}
            duration={1.5}
            delay={0.2}
            once={true}
          />
          <DiaTextReveal 
            text="PROCESS" 
            textColor="#ffffff" 
            colors={["#ffffff", "#ffffff", "transparent"]}
            duration={1.5}
            delay={0.4}
            once={true}
          />
        </h2>
        <p 
          className="max-w-md text-[#999] text-base md:text-lg font-light leading-relaxed mb-2"
          
        >
          See how our proven process transforms your brand with custom design solutions that deliver measurable impact from day one.
        </p>
      </div>

      {/* Staggered Boxes Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 md:grid-rows-2">
        
        {/* Row 1, Col 1: Box 01 */}
        <motion.div 
          style={{ y: isMobile ? undefined : yUp, opacity: isMobile ? undefined : opacityFade }}
          initial={isMobile ? "hidden" : undefined}
          whileInView={isMobile ? "visible" : undefined}
          viewport={{ once: true, margin: "-50px" }}
          variants={isMobile ? mobileVariants : undefined}
          className="bg-transparent p-10 flex flex-col order-1 overflow-hidden border border-white/15"
        >
          <div className="flex flex-col">
            <div className="w-12 h-12 bg-white flex items-center justify-center">
              <span className="text-[#0a0a0a] font-heading font-bold text-xl tracking-tight">01</span>
            </div>
            <div className="mt-8">
              <h3 className="font-heading text-2xl uppercase mb-4 font-light tracking-tighter">RESEARCH & DEFINE</h3>
              <p className="text-[#999] text-sm leading-relaxed font-light" >
                We begin by understanding the problem, the users, and the business goals from start to finish.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Row 1, Col 2: Empty (Hidden on Mobile) */}
        <div className="hidden md:block order-2"></div>

        {/* Row 1, Col 3: Box 03 */}
        <motion.div 
          style={{ y: isMobile ? undefined : yUp, opacity: isMobile ? undefined : opacityFade }}
          initial={isMobile ? "hidden" : undefined}
          whileInView={isMobile ? "visible" : undefined}
          viewport={{ once: true, margin: "-50px" }}
          variants={isMobile ? mobileVariants : undefined}
          className="bg-transparent p-10 flex flex-col order-3 overflow-hidden border border-white/15"
        >
          <div className="flex flex-col">
            <div className="w-12 h-12 bg-white flex items-center justify-center">
              <span className="text-[#0a0a0a] font-heading font-bold text-xl tracking-tight">03</span>
            </div>
            <div className="mt-8">
              <h3 className="font-heading text-2xl uppercase mb-4 font-light tracking-tighter">TEST & IMPLEMENT</h3>
              <p className="text-[#999] text-sm leading-relaxed font-light" >
                Refining the final solution, testing usability, and handing off assets for development.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Row 2, Col 1: Empty (Hidden on Mobile) */}
        <div className="hidden md:block order-4"></div>

        {/* Row 2, Col 2: Box 02 */}
        <motion.div 
          style={{ y: isMobile ? undefined : yDown, opacity: isMobile ? undefined : opacityFade }}
          initial={isMobile ? "hidden" : undefined}
          whileInView={isMobile ? "visible" : undefined}
          viewport={{ once: true, margin: "-50px" }}
          variants={isMobile ? mobileVariants : undefined}
          className="bg-transparent p-10 flex flex-col order-2 md:order-5 overflow-hidden border border-white/15"
        >
          <div className="flex flex-col">
            <div className="w-12 h-12 bg-white flex items-center justify-center">
              <span className="text-[#0a0a0a] font-heading font-bold text-xl tracking-tight">02</span>
            </div>
            <div className="mt-8">
              <h3 className="font-heading text-2xl uppercase mb-4 font-light tracking-tighter">IDEATE & DESIGN</h3>
              <p className="text-[#999] text-sm leading-relaxed font-light" >
                We craft clear, user-friendly flows and high-fidelity interfaces.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Row 2, Col 3: Empty (Hidden on Mobile) */}
        <div className="hidden md:block order-6"></div>

      </div>
    </section>
  );
}
