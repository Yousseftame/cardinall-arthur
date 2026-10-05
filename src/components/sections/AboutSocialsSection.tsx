// @ts-ignore
import CircularCarousel from '../CircularCarousel';

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
    <section className="w-full bg-black text-white pt-8 pb-0 md:pt-12 md:pb-0 overflow-hidden flex flex-col items-center -mt-[1px] -mb-[1px] md:mt-0 md:mb-0 relative z-20">
      <div className="text-center mb-4 md:mb-8 px-4 w-full flex flex-col items-center">
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
      <div className="w-full relative h-[400px] md:h-[450px]">
        <CircularCarousel 
          items={images.map((src, i) => ({ src, alt: `Social ${i}` }))}
          preset="cylinder"
          intro="rise"
          cardWidth={300}
          aspectRatio={0.85}
          captions={false}
          pauseOnHover={true}
          tilt={-2}
          speed={20}
          stretch={0}
        />
      </div>
    </section>
  );
}
