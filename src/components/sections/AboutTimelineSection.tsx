import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { DiaTextReveal } from '../ui/dia-text-reveal';

const timelineData = [
  {
    year: "1997",
    title: "Where It Began.",
    description: "What started as a small design studio grew from a shared fascination with form, material, and balance. Every early piece carried the idea that simplicity could feel profound.",
    align: "right"
  },
  {
    year: "2004",
    title: "Defining a Vision.",
    description: "Our approach evolved into more than aesthetics, it became a mindset. Precision, restraint, and purpose began to shape not just our designs, but our way of working.",
    align: "left"
  },
  {
    year: "2012",
    title: "Craft Refined.",
    description: "We built deeper partnerships with artisans and ateliers, mastering new techniques. This era marked a shift towards creating pieces that endure across generations.",
    align: "right"
  }
];

function TimelineItem({ item, index: _index }: { item: typeof timelineData[0], index: number }) {
  const isRight = item.align === "right";
  
  return (
    <motion.div 
      className={`relative flex w-full justify-between items-center ${isRight ? '' : 'flex-row-reverse'}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40% 0px -40% 0px" }}
    >
      {/* Empty Space for the Opposite Side */}
      <div className="hidden md:block w-1/2" />

      {/* The Central Dot */}
      <motion.div 
        className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full -translate-x-[7px] md:-translate-x-1/2 z-10"
        variants={{
          hidden: { backgroundColor: "#000", border: "2px solid rgba(255,255,255,0.2)" },
          visible: { backgroundColor: "#fff", border: "2px solid #fff", transition: { duration: 0.4 } }
        }}
      />

      {/* Content */}
      <div className={`w-full md:w-1/2 flex flex-col pl-8 md:pl-0 ${isRight ? 'md:pl-20' : 'md:pr-20'}`}>
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 } }
          }}
        >
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-6">
            <h3 className="text-3xl md:text-4xl font-heading font-light tracking-tighter">{item.title}</h3>
            <span className="text-sm tracking-widest text-white/60 font-medium">{item.year}</span>
          </div>
          <p 
            className="text-white/60 text-[17px] leading-relaxed max-w-md font-light tracking-tight"
            
          >
            {item.description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function AboutTimelineSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  // The scroll line tracks when the center of the viewport crosses this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} className="relative w-full bg-[#2C0E11] text-white py-40 px-4 md:px-12 overflow-hidden">
      
      {/* Title */}
      <motion.div 
        className="text-center mb-40"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-4xl md:text-7xl font-heading uppercase font-light tracking-tighter">
          <DiaTextReveal 
            text="OUR JOURNEY IN CRAFT." 
            textColor="#ffffff" 
            colors={["#ffffff"]} 
          />
        </h2>
      </motion.div>

      {/* Timeline Container */}
      <div className="relative max-w-5xl mx-auto py-10">
        
        {/* Faded Background Line */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/15 -translate-x-1/2" />
        
        {/* Animated Solid Line */}
        <motion.div 
          className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-white -translate-x-1/2 origin-top"
          style={{ scaleY: smoothProgress }}
        />

        {/* Timeline Items */}
        <div className="flex flex-col space-y-32 md:space-y-48">
          {timelineData.map((item, index) => (
            <TimelineItem key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
