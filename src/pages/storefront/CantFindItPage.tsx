import { useRef, useState } from 'react';
import { motion, type Variants, useScroll, useTransform } from 'framer-motion';
import { DiaTextReveal } from '../../components/ui/dia-text-reveal';
import SpecularButton from '../../components/SpecularButton';
import communityImg from '../../assets/community1.webp';
import FAQSection from '../../components/sections/FAQSection';
import PageTransition from '../../components/layout/PageTransition';
import { submitCantFindRequest } from '../../services/cantFind.service';
import toast from 'react-hot-toast';

const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.25,
    },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
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

export default function CantFindItPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    desiredNotes: '',
    designerInspiration: '',
    details: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  const validateEmail = (email: string) => EMAIL_REGEX.test(String(email).toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const desiredNotes = formData.desiredNotes.trim();
    const details = formData.details.trim();
    const designerInspiration = formData.designerInspiration.trim();

    if (!name || !email || !desiredNotes || !details) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (name.length < 2) {
      toast.error('Please enter a valid name (at least 2 characters).');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email format.');
      return;
    }

    if (desiredNotes.length < 3) {
      toast.error('Please describe the notes you are looking for.');
      return;
    }

    if (details.length < 10) {
      toast.error('Please share a bit more detail about your request.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCantFindRequest({
        name,
        email,
        desiredNotes,
        designerInspiration,
        details,
      });

      toast.success('Your scent request has been submitted. We will craft something special for you.', brandToastStyle);

      setFormData({
        name: '',
        email: '',
        desiredNotes: '',
        designerInspiration: '',
        details: '',
      });
    } catch (err) {
      console.error('Failed to submit scent request:', err);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageTransition />

      {/* Hero Section */}
      <div ref={containerRef} className="relative w-full min-h-screen bg-[#06114f] overflow-hidden flex items-center justify-center">
        {/* Scroll Parallax Wrapper */}
        <motion.div 
          className="absolute inset-0 w-full h-[115%] -top-[7%] origin-top pointer-events-none transform-gpu will-change-transform"
          style={{ y, scale: scrollScale }}
        >
          {/* Hardware-Accelerated Hero Image */}
          <motion.img 
            src={communityImg} 
            alt="Community Hero" 
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center select-none transform-gpu will-change-transform"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
          />
        </motion.div>
        
        {/* Original Electric Blue Overlays */}
        <div className="absolute inset-0 bg-[#071871]/40 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply pointer-events-none" />

        {/* Main Text Content */}
        <div className="relative z-10 w-full px-4 flex justify-center items-center">
          <motion.h1 
            className="text-[18vw] md:text-[220px] leading-none text-white flex items-center justify-center font-heading font-medium tracking-tight whitespace-nowrap overflow-hidden py-4"
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {"SAY HI".split("").map((letter, i) => (
              <motion.span key={i} variants={letterVariants} className="inline-block">
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}

          </motion.h1>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="min-h-screen bg-transparent text-white pt-32 pb-24 md:pt-40 flex items-center overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 xl:gap-32 items-center">
          
          {/* Left Side: Typography */}
          <div className="flex flex-col gap-10 z-10">
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl xl:text-[100px] uppercase leading-[0.85] font-light tracking-tighter">
              <DiaTextReveal 
                text="COMMUNITY" 
                textColor="#ffffff" 
                colors={["#ffffff", "#ffffff", "transparent"]}
                duration={1.5}
                delay={0.2}
                once={true}
              />
              <br/>
              <DiaTextReveal 
                text="REQUESTS" 
                textColor="#ffffff" 
                colors={["#ffffff", "#ffffff", "transparent"]}
                duration={1.5}
                delay={0.4}
                once={true}
              />
            </h1>
            <p 
              className="text-xl md:text-2xl font-medium leading-relaxed max-w-lg text-white/70"
              
            >
              Can't find your perfect scent? Share the notes you desire or the designer inspiration you're looking for, and let us craft it for you.
            </p>
          </div>

          {/* Right Side: Form */}
          <div className="flex flex-col justify-center w-full">
            <motion.form 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-10 md:gap-14 w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mt-8 lg:mt-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
                <motion.div variants={itemVariants} className="relative group">
                  <input 
                    type="text" 
                    placeholder="Your Name*" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg disabled:opacity-60"
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="relative group">
                  <input 
                    type="email" 
                    placeholder="Your Email*" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg disabled:opacity-60"
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="relative group">
                <input 
                  type="text" 
                  placeholder="Desired Notes (e.g. Vanilla, Bergamot, Oud)*" 
                  required
                  value={formData.desiredNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, desiredNotes: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg disabled:opacity-60"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <input 
                  type="text" 
                  placeholder="Designer Inspiration (Optional)" 
                  value={formData.designerInspiration}
                  onChange={(e) => setFormData(prev => ({ ...prev, designerInspiration: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg disabled:opacity-60"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <textarea 
                  placeholder="Additional Details or Story Behind the Request*" 
                  required
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg resize-y disabled:opacity-60"
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
                  disabled={isSubmitting}
                  className="!px-7 !py-3 md:!px-8 md:!py-3.5 text-xs tracking-wide font-medium uppercase !bg-gradient-to-br !from-white/10 !via-transparent !to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:!from-white/15 hover:!via-white/5 hover:!to-white/10 transition-all duration-300 w-fit cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-center gap-2.5 text-white">
                    {isSubmitting ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                  </div>
                </SpecularButton>
              </motion.div>
            </motion.form>
          </div>
          
        </div>
      </div>

      <FAQSection />
    </>
  );
}
