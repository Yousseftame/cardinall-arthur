import { useEffect, useRef, useState } from 'react';
import img1 from '../../assets/services1.avif';
import img2 from '../../assets/services2.avif';
import img3 from '../../assets/aboutus1.avif';
import img4 from '../../assets/aboutus3.avif';

const servicesData = [
  {
    num: "01",
    title: "BRAND STRATEGY",
    desc: "Clear positioning, messaging, and direction that define your brand's purpose, vision, growth, and long-term market leadership.",
    tags: ["MARKET RESEARCH", "BRAND POSITIONING", "MESSAGING STRATEGY"],
    img: img1
  },
  {
    num: "02",
    title: "VISUAL IDENTITY",
    desc: "A cohesive, memorable visual system that brings your brand to life across every touchpoint.",
    tags: ["LOGO DESIGN", "TYPOGRAPHY", "COLOR PALETTE"],
    img: img2
  },
  {
    num: "03",
    title: "WEB DEVELOPMENT",
    desc: "Modern, responsive websites designed to engage users, increase conversions, improve performance, and strengthen your brand.",
    tags: ["UI DESIGN", "RESPONSIVE DEVELOPMENT", "CMS INTEGRATION"],
    img: img3
  },
  {
    num: "04",
    title: "DIGITAL MARKETING",
    desc: "Data-driven campaigns that connect with your audience and accelerate business growth.",
    tags: ["SEO", "CONTENT STRATEGY", "SOCIAL MEDIA"],
    img: img4
  }
];

export default function ServicesSection() {
  const text = "WE CREATE POWERFUL BRANDS, SEAMLESS DIGITAL EXPERIENCES, AND RESPONSIVE, DEVICE-READY WEBSITES.";
  
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
  const wordElements = text.split(" ").map((word, wIndex) => {
    const charElements = word.split("").map((char, cIndex) => {
      const delay = globalIndex * 0.025; 
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
    globalIndex++; 
    return (
      <span key={wIndex} className="inline-block mr-[0.25em]">
        {charElements}
      </span>
    );
  });

  return (
    <section className="w-full bg-[#0a0a0a] text-white pt-12 pb-0 md:pt-20 md:pb-0">
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

      {/* Intro Header */}
      <div className="max-w-[900px] mx-auto flex flex-col items-center justify-center text-center gap-10 px-6 md:px-12">
        <div className="flex items-center gap-2 text-[18px] md:text-[22px] font-medium tracking-wide text-white" style={{ fontFamily: '"Outfit", sans-serif' }}>
          <div className="relative mt-[2px] flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </div>
          <span>Service</span>
        </div>
        <p 
          ref={textRef}
          className="text-[32px] md:text-[32px] leading-[1.15] font-heading font-bold uppercase tracking-normal flex flex-wrap justify-center"
        >
          {wordElements}
        </p>
      </div>

      {/* Sticky Stacking Cards Container */}
      <div className="relative w-full mt-32 md:mt-48">
        {servicesData.map((service, i) => (
          <div 
            key={i} 
            className="sticky w-full bg-[#0a0a0a] border-t border-b border-white/40 flex flex-col py-16 md:py-24 min-h-[85vh]"
            style={{ 
              top: '12vh', 
              zIndex: 10 + i
            }}
          >
            {/* Inner Content Wrapper */}
            <div className="w-full mx-auto px-6 md:px-12 lg:px-16">
              {/* Card Header (Title & Number) */}
              <div className="flex justify-between items-start pb-6 md:pb-10 mb-8 md:mb-12">
                <h3 className="text-4xl md:text-7xl font-heading font-bold uppercase tracking-tight w-3/4 leading-[0.9]">
                  {service.title}
                </h3>
                <span className="text-2xl md:text-5xl font-heading font-bold text-white/90">
                  {service.num}
                </span>
              </div>

              {/* Card Body (Image & Text) */}
              <div className="flex flex-col md:flex-row gap-10 md:gap-16 lg:gap-32 justify-between">
                {/* Image */}
                <div className="w-full md:w-[350px] lg:w-[450px] shrink-0 h-[250px] md:h-[300px] lg:h-[320px] overflow-hidden rounded-[1rem] md:rounded-[1.5rem]">
                  <img 
                    src={service.img} 
                    alt={service.title} 
                    className="w-full h-full object-cover filter brightness-90 hover:brightness-110 transition-all duration-700 hover:scale-105" 
                  />
                </div>

                {/* Text & Tags */}
                <div className="w-full md:max-w-[450px] lg:max-w-[600px] flex flex-col justify-center">
                  <p 
                    className="text-[#aaa] text-lg md:text-xl font-light leading-relaxed mb-10" 
                    style={{ fontFamily: '"Outfit", sans-serif' }}
                  >
                    {service.desc}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {service.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="px-5 py-2.5 rounded-full border border-white/20 text-[10px] md:text-[12px] font-medium tracking-[0.05em] uppercase text-white/80 whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
