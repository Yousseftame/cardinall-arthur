import { motion } from 'framer-motion';
import { DiaTextReveal } from "../ui/dia-text-reveal";
import founder1 from '../../assets/founder1.png';
import founder2 from '../../assets/founder2.png';

export default function AboutFoundersSection() {
  return (
    <section className="w-full bg-black text-white py-24 md:py-32 px-8 md:px-16 lg:px-24">
      <div className="w-full mx-auto max-w-[1400px]">
        <motion.div 
          className="mb-12 md:mb-20 px-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-medium tracking-tighter uppercase">
            <DiaTextReveal 
              text="THE FOUNDERS" 
              textColor="#ffffff" 
              colors={["#ffffff"]} 
            />
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {/* Founder 1 */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[5/4] rounded-2xl overflow-hidden bg-[#222]">
              <img 
                src={founder1} 
                alt="Daniel Carter" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="font-bold text-lg md:text-[20px] tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Daniel Carter</span>
              <span className="text-white/60 text-xs md:text-sm font-light" style={{ fontFamily: "'Outfit', sans-serif" }}>Founder & CEO</span>
            </div>
          </div>

          {/* Founder 2 */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[5/4] rounded-2xl overflow-hidden bg-[#222]">
              <img 
                src={founder2} 
                alt="Sophia Martinez" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="font-bold text-lg md:text-[20px] tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Sophia Martinez</span>
              <span className="text-white/60 text-xs md:text-sm font-light" style={{ fontFamily: "'Outfit', sans-serif" }}>Co-Founder & Chief Strategy Officer</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
