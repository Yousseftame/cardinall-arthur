import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import breakImage from '../../assets/breaksection.webp';

export default function BreakSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Zooms out from 1.2 to 1 as you scroll past
  const scale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);
  // Slight vertical parallax
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[60vh] md:h-[80vh] lg:h-screen overflow-hidden"
    >
      <motion.div 
        className="absolute inset-0 w-full h-[120%] bg-cover bg-center origin-center"
        style={{ 
          backgroundImage: `url(${breakImage})`,
          scale,
          y,
          top: "-10%"
        }}
      />
      {/* Optional dark overlay if needed */}
      <div className="absolute inset-0 bg-[#2C0E11]/20" />
    </section>
  );
}
