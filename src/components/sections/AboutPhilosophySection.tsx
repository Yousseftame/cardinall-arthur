import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

import img1 from '../../assets/aboutus1.avif';
import img2 from '../../assets/aboutus2.avif';
import img3 from '../../assets/aboutus3.avif';
import img4 from '../../assets/aboutus4.avif';

function AnimatedText({ 
  text, 
  progress, 
  startRange, 
  endRange 
}: { 
  text: string, 
  progress: MotionValue<number>, 
  startRange: number, 
  endRange: number 
}) {
  const characters = text.split("");
  const step = (endRange - startRange) / characters.length;
  
  return (
    <div className="flex overflow-hidden pt-2 pb-2 px-4">
      {characters.map((char, i) => {
        if (char === " ") {
          return <span key={i} className="inline-block w-[4vw] md:w-[3vw]" />;
        }
        
        const charStart = startRange + step * i;
        const charEnd = charStart + 0.05; 
        
        const y = useTransform(progress, [charStart, charEnd], ["150%", "0%"]);
        
        return (
          <motion.span 
            key={i} 
            className="inline-block"
            style={{ y }}
          >
            {char}
          </motion.span>
        );
      })}
    </div>
  );
}

export default function AboutPhilosophySection() {
  const containerRef = useRef<HTMLElement>(null);
  
  // Track scroll progress through the total 600vh section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section 
      ref={containerRef}
      className="relative w-full bg-black text-white" 
    >
      {/* Sticky Text Background */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-start pt-[25vh] md:pt-[30vh] overflow-hidden z-0">
        
        {/* Text Reveal Area */}
        <div className="flex flex-col items-center justify-center font-heading font-light tracking-tighter uppercase text-[15vw] md:text-[14vw] leading-[0.85]">
          <AnimatedText text="THINK." progress={smoothProgress} startRange={0.0} endRange={0.08} />
          <AnimatedText text="BUILD. WIN." progress={smoothProgress} startRange={0.08} endRange={0.16} />
        </div>
      </div>

      {/* Scrolling Images Container */}
      {/* Removing relative and z-10 here ensures this container doesn't form a stacking context, 
          allowing mix-blend-difference on the images to interact with the sticky text below! */}
      <div className="w-full pointer-events-none">
        
        {/* Absolute images positioned relative to the <section> */}
        {/* Balanced positioning: creates about a half-screen pause between text finish and first image */}
        <img 
          src={img1} 
          alt="Philosophy 1"
          className="absolute right-[5%] top-[150vh] w-[45vw] md:w-[28vw] mix-blend-difference z-20"
        />
        <img 
          src={img2} 
          alt="Philosophy 2"
          className="absolute left-[5%] top-[250vh] w-[40vw] md:w-[25vw] mix-blend-difference z-20"
        />
        <img 
          src={img3} 
          alt="Philosophy 3"
          className="absolute left-[20%] top-[350vh] w-[35vw] md:w-[22vw] mix-blend-difference z-20"
        />
        <img 
          src={img4} 
          alt="Philosophy 4"
          className="absolute right-[15%] top-[450vh] w-[50vw] md:w-[32vw] mix-blend-difference z-20"
        />

        {/* Tall spacer to stretch the section so all images can scroll past. 
            550vh spacer + 100vh sticky = 650vh total section height */}
        <div className="h-[550vh]"></div>
      </div>
    </section>
  );
}
