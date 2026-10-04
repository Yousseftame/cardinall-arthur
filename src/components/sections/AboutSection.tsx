import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import img1 from '../../assets/aboutus1.avif';
import img2 from '../../assets/aboutus2.avif';
import img3 from '../../assets/aboutus3.avif';
import img4 from '../../assets/aboutus4.avif';

export default function AboutSection() {
  const text = "WE'RE UI/UX DESIGNERS FOCUSED ON CREATING USER-CENTERED DIGITAL PRODUCTS THAT ARE FUNCTIONAL, ACCESSIBLE, AND VISUALLY ENGAGING. FROM MOBILE APPS TO COMPLEX DASHBOARDS, WE TURN IDEAS INTO INTUITIVE, ENJOYABLE EXPERIENCES.";
  
  const textRef = useRef<HTMLParagraphElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    
    if (textRef.current) observer.observe(textRef.current);
    return () => observer.disconnect();
  }, []);

  // Pre-calculate letters and their global staggered delay
  let globalIndex = 0;
  const wordElements = text.split(" ").map((word, wIndex) => {
    const charElements = word.split("").map((char, cIndex) => {
      const delay = globalIndex * 0.025; // Slower stagger per letter (25ms)
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
    globalIndex++; // Account for the space between words in the timing
    return (
      <span key={wIndex} className="inline-block mr-[0.25em]">
        {charElements}
      </span>
    );
  });

  // Framer Motion Scroll Setup for Gallery
  const galleryRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ["start 90%", "end 70%"] 
  });

  // Map scroll progress to vertical clip path reveals (starting with ~70% of the image visible)
  const clip1 = useTransform(scrollYProgress, [0, 0.4], ["inset(30% 0 0 0)", "inset(0% 0 0 0)"]);
  const clip2 = useTransform(scrollYProgress, [0.05, 0.45], ["inset(30% 0 0 0)", "inset(0% 0 0 0)"]);
  const clip3 = useTransform(scrollYProgress, [0.1, 0.5], ["inset(30% 0 0 0)", "inset(0% 0 0 0)"]);
  const clip4 = useTransform(scrollYProgress, [0.15, 0.55], ["inset(30% 0 0 0)", "inset(0% 0 0 0)"]);

  return (
    <section 
      id="about" 
      className="w-full bg-[#0a0a0a] text-white py-32 md:py-48 px-8 md:px-16 lg:px-24 border-t border-white/5"
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
        
        {/* Left Side: Label */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="md:w-[200px] lg:w-[240px] flex-shrink-0"
        >
          <div className="flex items-center gap-1.5 text-[24px] font-heading font-medium tracking-normal uppercase">
            <span className="text-[22px] leading-none mb-0.5">®</span>
            <span>ABOUT</span>
          </div>
        </motion.div>

        {/* Right Side: Large Text */}
        <div className="flex-1">
          <p 
            ref={textRef}
            className="text-[32px] leading-[1.15] font-serif font-light uppercase tracking-tighter flex flex-wrap"
          >
            {wordElements}
          </p>

          {/* Statistics Row (Aligned with description) */}
          <div className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 justify-items-start">
            <StatItem end="10" suffix="+" label="YEARS OF EXPERIENCE" />
            <StatItem end="40" suffix="+" label="PROJECTS COMPLETED" />
            <StatItem end="95" suffix="%" label="REPEAT CLIENTS" />
          </div>
        </div>

      </div>

      {/* Pyramid Image Gallery */}
      <div ref={galleryRef} className="max-w-[1400px] mx-auto mt-24 md:mt-32 relative z-10">
        <div className="flex items-end gap-4 w-full h-[400px] md:h-[600px]">
          
          {/* Image 1 (Tallest) */}
          <motion.div 
            style={{ clipPath: clip1 }}
            className="flex-1 h-full overflow-hidden"
          >
            <img src={img1} alt="About Us 1" className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700 hover:scale-105" />
          </motion.div>

          {/* Image 2 */}
          <motion.div 
            style={{ clipPath: clip2 }}
            className="flex-1 h-[75%] overflow-hidden"
          >
            <img src={img2} alt="About Us 2" className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700 hover:scale-105" />
          </motion.div>

          {/* Image 3 */}
          <motion.div 
            style={{ clipPath: clip3 }}
            className="flex-1 h-[50%] overflow-hidden"
          >
            <img src={img3} alt="About Us 3" className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700 hover:scale-105" />
          </motion.div>

          {/* Image 4 (Shortest) */}
          <motion.div 
            style={{ clipPath: clip4 }}
            className="flex-1 h-[30%] overflow-hidden"
          >
            <img src={img4} alt="About Us 4" className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700 hover:scale-105" />
          </motion.div>

        </div>
      </div>

    </section>
  );
}

function StatItem({ end, suffix, label }: { end: string; suffix: string; label: string }) {
  return (
    <div className="flex flex-col items-start justify-center group">
      <div className="flex items-start mb-2">
        <span className="text-[56px] md:text-[64px] leading-none font-heading font-medium tracking-tight text-white">
          {end}
        </span>
        <span className="text-[24px] md:text-[28px] leading-none font-heading font-medium text-white ml-1 mt-1">
          {suffix}
        </span>
      </div>
      <div className="text-[10px] md:text-[12px] tracking-[0.15em] font-heading font-semibold uppercase text-white/80">
        {label}
      </div>
    </div>
  );
}
