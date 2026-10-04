import { useEffect, useRef, useState } from 'react';

export default function AboutVisionSection() {
  const fullText = "CARDINALL ARTHUR — BUILT BEYOND IDENTITY. VISION DEFINED. BRAND SHAPED. SYSTEMS DESIGNED. PERFORMANCE ENGINEERED. WE CREATE STRUCTURE WHERE THERE IS NOISE, CLARITY WHERE THERE IS COMPLEXITY, AND DIRECTION WHERE THERE IS FRICTION. EVERYTHING MOVES TOGETHER. NOTHING STANDS ALONE. A UNIFIED SYSTEM, CRAFTED WITH PRECISION. BUILT TO SCALE. BUILT TO ENDURE.";
  
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

  let globalIndex = 0;
  
  const renderText = (text: string) => {
    return text.split(" ").map((word, wIndex) => {
      const charElements = word.split("").map((char, cIndex) => {
        const delay = globalIndex * 0.015; // Slightly faster stagger per letter so the long text completes nicely
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
  };

  return (
    <section className="w-full bg-black text-white py-32 md:py-48 px-8 md:px-16 lg:px-24">
      <style>
        {`
          @keyframes illuminateWhite {
            0% { color: rgba(255,255,255,0.2); }
            100% { color: rgba(255,255,255,1); }
          }
          .char-reveal {
            color: rgba(255,255,255,0.2);
            transition: color 0.1s;
          }
          .char-reveal.active {
            animation: illuminateWhite 0.8s forwards ease-out;
          }
        `}
      </style>

      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-8 md:gap-24">
        <div className="flex-1">
          <p 
            ref={textRef}
            className="text-[32px] leading-[1.15] font-serif font-light uppercase tracking-tighter flex flex-wrap"
          >
            {renderText(fullText)}
          </p>
        </div>
      </div>
    </section>
  );
}
