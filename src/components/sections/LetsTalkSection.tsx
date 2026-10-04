import SpecularButton from '../SpecularButton';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import { motion, type Variants } from 'framer-motion';
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};



export default function LetsTalkSection() {
  return (
    <section id="letstalk" className="w-full bg-[#0a0a0a] text-white pt-24 md:pt-32 pb-16 overflow-hidden">
      <div className="w-full max-w-[120rem] mx-auto px-4 md:px-10 lg:px-16 xl:px-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 xl:gap-40">
        
        {/* Left Column */}
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-16 md:gap-24">
            <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl xl:text-8xl uppercase leading-[0.85] whitespace-nowrap font-light tracking-tighter">
              <DiaTextReveal 
                text="LET'S TALK" 
                textColor="#ffffff" 
                colors={["#ffffff", "#ffffff", "transparent"]}
                duration={1.5}
                delay={0.2}
                once={true}
              />
            </h2>
            
            <p 
              className="text-xl md:text-2xl lg:text-[22px] font-serif font-light uppercase leading-snug tracking-tighter max-w-lg"
              
            >
              HAVE AN IDEA IN MIND? LET'S CONNECT AND EXPLORE HOW WE CAN HELP BRING IT TO LIFE.
            </p>
          </div>

          <div className="flex items-center gap-4 md:gap-6 mt-16 lg:mt-32">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" 
              alt="Leon Rowley" 
              className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-primary font-black text-lg md:text-xl uppercase tracking-wide">LEON ROWLEY</span>
              <span className="text-gray-200 text-sm md:text-base tracking-normal font-medium">CEO and Founder</span>
            </div>
          </div>
        </div>

        {/* Right Column (Form) */}
        <div className="flex flex-col justify-center w-full">
          <motion.form 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-10 md:gap-14 w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mt-8 lg:mt-0"
          >
            
            <motion.div variants={itemVariants} className="relative group">
              <input 
                type="text" 
                placeholder="Your Name*" 
                required
                className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <input 
                type="email" 
                placeholder="Your Email*" 
                required
                className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <textarea 
                placeholder="Your Message*" 
                required
                rows={3}
                className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg resize-y"
              ></textarea>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <SpecularButton 
                type="submit"
                size="md"
                radius={14}
                tintOpacity={0}
                blur={12}
                baseColor="#52525b"
                className="!px-7 !py-3 md:!px-8 md:!py-3.5 text-xs tracking-wide font-medium uppercase !bg-gradient-to-br !from-white/10 !via-transparent !to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:!from-white/15 hover:!via-white/5 hover:!to-white/10 transition-all duration-300 w-fit"
              >
                <div className="flex items-center justify-center gap-2.5 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  Contact
                </div>
              </SpecularButton>
            </motion.div>

          </motion.form>
        </div>
        
      </div>

      {/* Infinite Scroll Velocity Section - Hidden on Home Page */}
      {/* <div className="mt-32 md:mt-48 w-full flex flex-col gap-6 md:gap-10">
        <ScrollVelocity
          texts={[Row1, Row2]}
          velocity={60}
          className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase tracking-tight flex items-center"
          parallaxClassName="py-2 overflow-hidden flex items-center"
        />
      </div> */}
    </section>
  );
}
