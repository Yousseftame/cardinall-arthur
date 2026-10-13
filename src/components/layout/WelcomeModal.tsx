import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import emailsentImg from '../../assets/emailsent.avif';
import { subscribeNewsletter } from '../../services/newsletter.service';
import toast from 'react-hot-toast';

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenWelcome');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 13000); // Wait 13 seconds for hero animations to finish
      return () => clearTimeout(timer);
    }
  }, []);

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
      await subscribeNewsletter({ email: trimmed, source: 'welcome' });
      setSubscribed(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2800);
    } catch (err) {
      console.error('Newsletter subscribe failed:', err);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#2C0E11]/80 backdrop-blur-md overflow-hidden cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[95%] max-w-[460px] aspect-[1/1.1] mx-auto mt-[35vh] md:mt-[25vh] cursor-auto"
          >
            {/* The Physical Card - Sharp, minimalist, like a real printed card */}
            <div className="absolute z-0 w-[90%] md:w-[85%] max-w-[420px] left-1/2 -translate-x-1/2 bg-[#f8f7f3] rounded-sm p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.7)] flex flex-col items-start text-left bottom-[52%] md:bottom-[53%]">
              <AnimatePresence mode="wait">
                {!subscribed ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <h2 className="font-sans text-xl md:text-3xl text-black font-bold tracking-tight mb-3">
                      Join Cardinal Arthur.
                    </h2>
                    
                    <div className="space-y-2 text-[#1a1a1a]/80 text-xs md:text-sm font-medium leading-relaxed mb-6">
                      <p>Exclusive access to new collections, private sales, and insider news.</p>
                      <p><strong className="text-black font-bold">And we give back.</strong> Every purchase helps build the community.</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="w-full relative flex items-center border-b-[1.5px] border-[#1a1a1a]/40 pb-2 mb-6 group focus-within:border-[#1a1a1a] transition-colors">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        disabled={isSubmitting}
                        className="w-full bg-transparent text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:outline-none font-medium text-sm md:text-base disabled:opacity-60"
                      />
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-4 text-[#1a1a1a]/40 group-focus-within:text-[#1a1a1a] hover:text-[#2C0E11] transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span className="w-5 h-5 border-2 border-[#2C0E11]/20 border-t-[#2C0E11] rounded-full animate-spin block" />
                        ) : (
                          <ArrowRight strokeWidth={2} className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                    
                    <div className="flex items-end justify-between w-full mt-4">
                      <button 
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] md:text-xs text-[#1a1a1a]/80 hover:text-black transition-colors font-bold tracking-wider uppercase mb-1"
                      >
                        No thanks, take me to store
                      </button>
                      
                      {/* Website Logo */}
                      <img 
                        src="/logo-removebg-preview.png" 
                        alt="Cardinal Arthur" 
                        className="h-10 md:h-14 w-auto object-contain"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-start justify-center text-left py-4 pb-10 w-full"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2C0E11]" />
                      <span className="text-[10px] md:text-xs font-bold tracking-[0.18em] uppercase text-[#2C0E11]/70">
                        Cardinal Arthur
                      </span>
                    </div>

                    <h2 className="font-heading text-2xl md:text-3xl text-[#2C0E11] font-medium tracking-tight mb-3 leading-none">
                      You're on the list.
                    </h2>

                    <div className="w-10 h-px bg-[#2C0E11]/25 mb-4" />

                    <p className="text-[#1a1a1a]/75 text-xs md:text-sm font-medium leading-relaxed max-w-[280px]">
                      Welcome to the inner circle. Watch your inbox for exclusive drops and private offers.
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] font-semibold text-[#C9A86A]">
                      <span className="w-1 h-1 rounded-full bg-[#C9A86A]" />
                      Subscription confirmed
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The 3D Hand Image */}
            <img 
              src={emailsentImg} 
              alt="Welcome" 
              className="absolute bottom-0 w-full h-[100%] object-contain object-bottom pointer-events-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-10"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
