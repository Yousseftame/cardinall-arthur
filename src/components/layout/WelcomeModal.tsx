import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import emailsentImg from '../../assets/emailsent.avif';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
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
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden cursor-pointer"
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

                    <form onSubmit={handleSubmit} className="w-full relative flex items-center border-b-[1.5px] border-[#1a1a1a]/40 pb-2 mb-6 group focus-within:border-[#1a1a1a] transition-colors">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full bg-transparent text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:outline-none font-medium text-sm md:text-base"
                      />
                      <button 
                        type="submit"
                        className="ml-4 text-[#1a1a1a]/40 group-focus-within:text-[#1a1a1a] hover:text-[#E63946] transition-colors"
                      >
                        <ArrowRight strokeWidth={2} className="w-5 h-5" />
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-start justify-center text-left py-6 pb-12 w-full"
                  >
                    <div className="w-12 h-12 rounded-sm bg-[#E63946] flex items-center justify-center mb-6">
                      <Check strokeWidth={3} className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="font-heading text-xl md:text-2xl text-black font-bold tracking-tight mb-3">
                      You're on the list.
                    </h2>
                    <p className="text-[#1a1a1a]/80 text-xs md:text-sm font-medium">
                      Keep an eye on your inbox for something special.
                    </p>
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
