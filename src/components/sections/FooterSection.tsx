import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpecularButton from '../SpecularButton';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import { motion, type Variants, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import ScrollVelocity from '../ScrollVelocity';
import { subscribeNewsletter } from '../../services/newsletter.service';
import toast from 'react-hot-toast';

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

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const brandToastStyle = {
  style: {
    background: 'rgba(44, 14, 17, 0.95)',
    color: '#ffffff',
    border: '1px solid rgba(201, 168, 106, 0.4)',
    borderRadius: '100px',
    padding: '14px 24px',
    fontSize: '14px',
    letterSpacing: '0.02em',
  },
  iconTheme: {
    primary: '#C9A86A',
    secondary: '#2C0E11',
  },
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
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-100%", "0%"]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      toast.error('Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmed.toLowerCase())) {
      toast.error('Please enter a valid email format.');
      return;
    }

    setIsSubmitting(true);
    try {
      await subscribeNewsletter({ email: trimmed, source: 'footer' });
      toast.success('You are subscribed. Welcome to Cardinal Arthur.', brandToastStyle);
      setEmail('');
    } catch (err) {
      console.error('Newsletter subscribe failed:', err);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <footer className="w-full bg-transparent text-white pt-12 md:pt-16 pb-8 px-4 md:px-8 lg:px-12 -mt-px">
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
            {[
              { label: 'HOME', to: '/' },
              { label: 'THE CLUB', to: '/club' },
              { label: 'FAQ', to: '/faq' },
              { label: 'TERMS', to: '/terms' },
            ].map((link) => (
              <motion.div key={link.label} variants={itemVariants}>
                <Link
                  to={link.to}
                  className="font-serif text-xl md:text-[22px] font-light uppercase tracking-tighter hover:text-primary transition-colors w-fit block"
                >
                  {link.label}
                </Link>
              </motion.div>
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
            <motion.form 
              variants={itemVariants} 
              onSubmit={handleSubmit}
              noValidate
              className="flex items-center w-full gap-4 max-w-lg border-b border-white pb-3 justify-between"
            >
              <input 
                type="email" 
                placeholder="Enter email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="bg-transparent border-none focus:outline-none text-white placeholder-white w-full text-sm disabled:opacity-60"
                required
              />
              <SpecularButton 
                type="submit"
                size="sm"
                radius={14}
                tintOpacity={0}
                blur={12}
                baseColor="#52525b"
                disabled={isSubmitting}
                className="!px-5 !py-2.5 text-xs tracking-wide font-medium uppercase !bg-gradient-to-br !from-white/10 !via-transparent !to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:!from-white/15 hover:!via-white/5 hover:!to-white/10 transition-all duration-300 w-fit shrink-0 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-2 text-white font-sans">
                  {isSubmitting ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  )}
                  <span>{isSubmitting ? 'Sending...' : 'Subscribe'}</span>
                </div>
              </SpecularButton>
            </motion.form>
          </div>

        </motion.div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-0 text-xs md:text-sm font-mono text-white">
          <div className="flex items-center">
            <span className="text-primary mr-1 font-sans text-base">©</span> 2026 Cardinal®.
          </div>
          
          <div className="flex items-center gap-6 md:gap-8">
            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          </div>

          <div className="flex items-center text-white font-sans tracking-wide">
            Crafted with precision & elegance.
          </div>
        </div>

      </div>
    </footer>
    
    {/* Primary Footer Reveal Block */}
    <div ref={containerRef} className="hidden w-full h-[150px] md:h-[220px] lg:h-[300px] overflow-hidden bg-transparent">
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
