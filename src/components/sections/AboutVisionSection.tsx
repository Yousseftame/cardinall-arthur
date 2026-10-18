import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_VISION, getVision } from '../../services/vision.service';

export default function AboutVisionSection() {
  const { data: vision } = useQuery({
    queryKey: ['vision'],
    queryFn: getVision,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const text = (vision?.text || DEFAULT_VISION.text).trim();

  const textRef = useRef<HTMLParagraphElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setInView(false);
    const el = textRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  let globalIndex = 0;

  const wordElements = text.split(/\s+/).filter(Boolean).map((word, wIndex) => {
    const charElements = word.split('').map((char, cIndex) => {
      const delay = globalIndex * 0.015;
      globalIndex++;
      return (
        <span
          key={cIndex}
          className={`char-reveal ${inView ? 'active' : ''}`}
          style={{ animationDelay: inView ? `${delay}s` : '0s' }}
        >
          {char}
        </span>
      );
    });
    globalIndex++;
    return (
      <span key={wIndex} className="inline-block mr-[0.25em]">
        {charElements}
      </span>
    );
  });

  return (
    <section className="relative z-10 w-full bg-transparent text-white py-16 md:py-48 px-6 md:px-16 lg:px-24 border-none outline-none -mt-[1px] -mb-[1px] md:mt-0 md:mb-0">
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
            className="text-[20px] md:text-[32px] leading-[1.25] md:leading-[1.15] font-serif font-light uppercase tracking-tighter flex flex-wrap"
          >
            {wordElements}
          </p>
        </div>
      </div>
    </section>
  );
}
