

const images = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  "https://images.unsplash.com/photo-1524041255072-7da0525d6b34?w=800&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",
];

export default function AboutSocialsSection() {
  return (
    <section className="w-full bg-black text-white py-24 md:py-32 overflow-hidden flex flex-col items-center">
      <div className="text-center mb-16 md:mb-24 px-4 w-full flex flex-col items-center">
        <h2 
          className="text-4xl md:text-5xl lg:text-[64px] mb-6 font-heading font-light tracking-tighter"
          
        >
          On Socials
        </h2>
        <p 
          className="text-white/60 text-[15px] md:text-[17px] leading-relaxed font-light text-center"
          
        >
          A look inside our process, behind-the-scenes stories, material<br className="hidden md:block" /> studies, and glimpses of what inspires us daily.
        </p>
      </div>

      {/* Infinite Gallery Marquee */}
      <div className="w-full relative">
        <div className="flex w-fit animate-marquee">
          {/* Double the images array to create seamless loop */}
          {[...images, ...images].map((src, i) => (
            <div 
              key={i} 
              className="w-[12.5vw] flex-shrink-0 aspect-square mr-[2px] relative group cursor-pointer"
            >
              <img 
                src={src} 
                alt={`Social ${i}`} 
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-white w-8 h-8 md:w-10 md:h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
