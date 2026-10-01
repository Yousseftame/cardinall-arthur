import { useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { DiaTextReveal } from '../ui/dia-text-reveal';

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 60, 
    scale: 0.95, 
    rotateX: -15,
    filter: 'blur(5px)'
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: { 
      duration: 1.4, 
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number] 
    } 
  }
};

function PartnerCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div 
      variants={itemVariants} 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative rounded-xl overflow-hidden group cursor-default aspect-[4/3] md:aspect-[3/2] p-[1px] bg-white/[0.03]"
    >
      {/* Outer Spotlight (Creates the dynamic border glow) */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.25), transparent 40%)`
        }}
      />
      
      {/* Inner Card Surface */}
      <div className="relative z-10 w-full h-full bg-[#0a0a0a] rounded-[11px] overflow-hidden flex items-center justify-center">
        
        {/* Inner Spotlight (Illuminates the background behind the logo) */}
        <div 
          className="absolute inset-0 z-0 transition-opacity duration-1000 ease-out opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.04), transparent 40%)`
          }}
        />
        
        {/* Content page */}
        <div className="relative z-10 text-white/40 group-hover:text-white transition-colors duration-1000 ease-out">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

const partnersData = [
  <div className="font-sans font-bold text-xl md:text-2xl tracking-tight flex items-center gap-2">
    IPSUM<sup className="text-[10px]">&reg;</sup>
  </div>,
  <div className="flex flex-col items-center gap-2">
    <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
    <span className="font-sans font-semibold text-[10px] md:text-xs tracking-widest uppercase">Logoipsum</span>
  </div>,
  <div className="flex items-center gap-3">
    <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20" />
    </svg>
    <span className="font-sans font-medium text-sm md:text-base tracking-widest uppercase">Logoipsum</span>
  </div>,
  <div className="font-serif font-bold text-2xl md:text-3xl tracking-tight italic">
    logoipsum
  </div>,
  <div className="flex items-center gap-2">
    <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
    <span className="font-sans font-bold text-sm md:text-lg tracking-tighter">logoipsum</span>
  </div>,
  <div className="flex items-center gap-2">
    <span className="font-sans font-medium text-sm md:text-base tracking-wide">logo</span>
    <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
    <span className="font-sans font-medium text-sm md:text-base tracking-wide">ipsum</span>
  </div>,
  <div>
    <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </div>,
  <div className="font-heading font-black text-xl md:text-2xl tracking-[0.2em] italic flex items-center gap-1">
    <svg className="w-6 h-6 md:w-8 md:h-8 -mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    LOGOIPSUM
  </div>
];

export default function TrustedPartnersSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  return (
    <section className="relative w-full py-24 md:py-32 bg-black text-white flex flex-col items-center">
      <div className="relative z-10 w-full mb-16 md:mb-20 px-4 flex flex-col items-center text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-7xl font-heading font-medium tracking-tighter uppercase"
        >
          <DiaTextReveal 
            text="TRUSTED PARTNERS." 
            textColor="#ffffff" 
            colors={["#ffffff"]} 
          />
        </motion.h2>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl px-4 md:px-8"
      >
        {partnersData.map((content, idx) => (
          <PartnerCard key={idx}>
            {content}
          </PartnerCard>
        ))}
      </motion.div>
    </section>
  );
}
