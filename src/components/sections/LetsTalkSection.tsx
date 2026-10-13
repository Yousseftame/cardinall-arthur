import React, { useState } from 'react';
import SpecularButton from '../SpecularButton';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import { motion, type Variants } from 'framer-motion';
import { submitContactMessage } from '../../services/contact.service';
import toast from 'react-hot-toast';

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

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PHONE_REGEX = /^[\+0-9\s\-]{10,20}$/;

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

export default function LetsTalkSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => EMAIL_REGEX.test(String(email).toLowerCase());
  const validatePhone = (phone: string) => PHONE_REGEX.test(phone.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const message = formData.message.trim();

    if (!name || !email || !phone || !message) {
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

    if (!validatePhone(phone)) {
      toast.error('Please enter a valid phone number (e.g. +20 10 11151366).');
      return;
    }

    if (message.length < 10) {
      toast.error('Please share a bit more detail in your message.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContactMessage({
        name,
        email,
        phone,
        message,
      });

      toast.success('Your message has been sent. We will get back to you shortly.', brandToastStyle);

      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (err) {
      console.error('Failed to submit contact message:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="letstalk" className="w-full bg-transparent text-white pt-24 md:pt-32 pb-16 overflow-hidden">
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
              src="/logo-removebg-preview.png" 
              alt="Cardinal Arthur Logo" 
              className="w-14 h-14 md:w-16 md:h-16 object-contain"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-primary font-black text-lg md:text-xl uppercase tracking-wide">CARDINAL ARTHUR</span>
              <span className="text-gray-200 text-sm md:text-base tracking-normal font-medium">Client Support</span>
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
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-10 md:gap-14 w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mt-8 lg:mt-0"
          >
            
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

            <motion.div variants={itemVariants} className="relative group">
              <input 
                type="tel" 
                placeholder="Your Phone Number*" 
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-white focus:border-white focus:outline-none py-3 md:py-4 text-white placeholder-white transition-colors text-base md:text-lg disabled:opacity-60"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <textarea 
                placeholder="Your Message*" 
                required
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
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
                  <span>{isSubmitting ? 'Sending...' : 'Contact'}</span>
                </div>
              </SpecularButton>
            </motion.div>

          </motion.form>
        </div>
        
      </div>
    </section>
  );
}
