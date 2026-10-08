import { ArrowUpRight } from 'lucide-react';
import SpecularButton from '../SpecularButton';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import { motion, type Variants, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import ScrollVelocity from '../ScrollVelocity';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const BrandRow = (
  <div className="flex items-center whitespace-nowrap text-black/90 font-heading font-normal text-[5rem] md:text-[8rem] lg:text-[11rem] xl:text-[13rem] uppercase tracking-wide leading-[0.8] py-4">
    <span>CARDINAL</span>
    <span className="mx-6 md:mx-12">-</span>
    <span>ARTHUR</span>
    <span className="mx-6 md:mx-12">-</span>
  </div>
);

export default function FooterSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-100%", "0%"]);

  return (
    <>
    <footer className="w-full bg-[#2C0E11] text-white pt-12 md:pt-16 pb-8 px-4 md:px-8 lg:px-12 w-full">
      <div className="w-full flex flex-col">
        
        {/* Top Centered Section */}
        <div className="flex flex-col items-center justify-center text-center mb-24 md:mb-32">
          <p className="text-gray-400 text-sm md:text-base font-light mb-4 md:mb-6">
            Reach out if you're ready to make something amazing together.
          </p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl uppercase break-all w-full leading-none whitespace-nowrap overflow-hidden font-light tracking-tighter">
            <DiaTextReveal 
              text="INFO@CARDINAL.COM" 
              textColor="#ffffff" 
              colors={["#ffffff", "#ffffff", "transparent"]}
              duration={1.5}
              delay={0.2}
              once={true}
            />
          </h2>
        </div>

        {/* Middle Section (Links & Newsletter) */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          
          {/* Socials */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER'].map((social) => (
              <motion.a variants={itemVariants} href="#" key={social} className="flex items-center gap-1.5 group w-fit">
                <span className="font-serif text-xl md:text-[22px] font-light uppercase tracking-tighter group-hover:text-primary transition-colors">
                  {social}
                </span>
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
              </motion.a>
            ))}
          </div>

          {/* Nav Links */}
          <div className="lg:col-span-2 lg:col-start-4 xl:col-start-5 flex flex-col gap-3">
            {['HOME', 'ABOUT', 'SERVICE', 'PROJECT'].map((link) => (
              <motion.a variants={itemVariants} href={`#${link.toLowerCase()}`} key={link} className="font-serif text-xl md:text-[22px] font-light uppercase tracking-tighter hover:text-primary transition-colors w-fit">
                {link}
              </motion.a>
            ))}
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-5 lg:col-start-8 flex flex-col justify-start mt-8 lg:mt-0">
            <motion.p 
              variants={itemVariants}
              className="text-white text-sm leading-relaxed mb-10 max-w-[300px]"
              
            >
              Sign up for our newsletter to get latest insights and updates
            </motion.p>
            <motion.form variants={itemVariants} className="flex items-center w-full gap-4 max-w-lg border-b border-white pb-3 justify-between">
              <input 
                type="email" 
                placeholder="Enter email address" 
                className="bg-transparent border-none focus:outline-none text-white placeholder-white w-full text-sm"
                
                required
              />
              <SpecularButton 
                type="submit"
                size="sm"
                radius={14}
                tintOpacity={0}
                blur={12}
                baseColor="#52525b"
                className="!px-5 !py-2.5 text-xs tracking-wide font-medium uppercase !bg-gradient-to-br !from-white/10 !via-transparent !to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:!from-white/15 hover:!via-white/5 hover:!to-white/10 transition-all duration-300 w-fit shrink-0"
              >
                <div className="flex items-center justify-center gap-2 text-white font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  Subscribe
                </div>
              </SpecularButton>
            </motion.form>
          </div>

        </motion.div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-[#222] flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-0 text-xs md:text-sm font-mono text-white">
          <div className="flex items-center">
            <span className="text-primary mr-1 font-sans text-base">©</span> 2025 Cardinal®.
          </div>
          
          <div className="flex items-center gap-6 md:gap-8">
            <a href="#" className="hover:text-primary transition-colors">License</a>
            <a href="#" className="hover:text-primary transition-colors">Changelog</a>
            <a href="#" className="hover:text-primary transition-colors">Style Guide</a>
          </div>

          <div className="flex items-center text-white font-sans tracking-wide">
            Crafted with precision & elegance.
          </div>
        </div>

      </div>
    </footer>
    
    {/* Primary Footer Reveal Block */}
    <div ref={containerRef} className="hidden w-full h-[150px] md:h-[220px] lg:h-[300px] overflow-hidden bg-[#2C0E11]">
      <motion.div style={{ y }} className="w-full h-full bg-primary flex items-center">
        <ScrollVelocity 
          texts={[BrandRow]} 
          velocity={90} 
          className="flex items-center"
          parallaxClassName="py-2 overflow-hidden flex items-center"
          disableScroll={true}
        />
      </motion.div>
    </div>
    </>
  );
}
