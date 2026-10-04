import ScrollExpand from '../ScrollExpand';
import latestImg from '../../assets/latest.svg';
import latest2Img from '../../assets/latest2.svg';
import { DiaTextReveal } from '../ui/dia-text-reveal';

export default function LatestProjectsSection() {
  return (
    <section className="w-full bg-[#0a0a0a] text-white relative pt-10 md:pt-20 pb-20">
      <div className="flex flex-col items-center justify-center -mb-4 md:-mb-12 relative z-10">
        <h2 className="font-heading text-4xl md:text-6xl uppercase leading-[0.9] text-center font-light tracking-tighter">
          <DiaTextReveal 
            text="LATEST PROJECTS" 
            textColor="#ffffff" 
            colors={["#ffffff", "#ffffff", "transparent"]}
            duration={1.5}
            delay={0.2}
            once={true}
          />
        </h2>
      </div>

      <ScrollExpand
        useWindowScroll={true}
        src={latestImg}
        mediaType="image"
        scrollHint="SCROLL TO DISCOVER"
        startWidth={50}
        startHeight={70}
        startRadius={24}
        endRadius={0}
        mediaZoom={1.2}
        holdDistance={2.2}
        className="w-full"
      >
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto space-y-6 md:space-y-8">
          <h3 className="font-heading text-5xl md:text-8xl uppercase text-white drop-shadow-lg font-light tracking-tighter">
            CRIMSON DUST
          </h3>
          <p className="text-white/90 text-lg md:text-2xl font-light max-w-2xl text-center leading-relaxed drop-shadow-md" >
            A comprehensive brand strategy and visual identity exploring the boundaries of modern digital aesthetics and bold storytelling.
          </p>
          <button className="px-8 py-4 md:px-10 md:py-5 bg-white text-black uppercase font-bold tracking-widest text-sm md:text-base rounded-full hover:bg-white/90 hover:scale-105 transition-all duration-300 mt-4 shadow-xl">
            View Case Study
          </button>
        </div>
      </ScrollExpand>

      <ScrollExpand
        useWindowScroll={true}
        src={latest2Img}
        mediaType="image"
        scrollHint="SCROLL TO DISCOVER"
        startWidth={50}
        startHeight={70}
        startRadius={24}
        endRadius={0}
        mediaZoom={1.2}
        className="w-full -mt-[220vh] relative z-20"
      >
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto space-y-6 md:space-y-8">
          <h3 className="font-heading text-5xl md:text-8xl uppercase text-white drop-shadow-lg font-light tracking-tighter">
            NOIR COLLECTION
          </h3>
          <p className="text-white/90 text-lg md:text-2xl font-light max-w-2xl text-center leading-relaxed drop-shadow-md" >
            Elevating everyday luxury through minimalist design, meticulous craftsmanship, and striking visual contrasts.
          </p>
          <button className="px-8 py-4 md:px-10 md:py-5 bg-white text-black uppercase font-bold tracking-widest text-sm md:text-base rounded-full hover:bg-white/90 hover:scale-105 transition-all duration-300 mt-4 shadow-xl">
            View Case Study
          </button>
        </div>
      </ScrollExpand>
    </section>
  );
}
