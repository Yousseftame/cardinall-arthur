import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  // Initialize countdown from localStorage on mount
  useEffect(() => {
    const savedTimestamp = localStorage.getItem('cardinal_reset_timestamp');
    if (savedTimestamp) {
      setEmailSent(true);
      const timePassed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      if (timePassed < 60) {
        setCountdown(60 - timePassed);
      } else {
        localStorage.removeItem('cardinal_reset_timestamp');
      }
    }
  }, []);

  // Handle countdown timer decrement
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('cardinal_reset_timestamp');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email format.');
      return;
    }
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset link sent! Check your inbox.');
      setCountdown(60);
      setEmailSent(true);
      localStorage.setItem('cardinal_reset_timestamp', Date.now().toString());
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to send reset email.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else {
        errorMessage = error.message?.replace(/Firebase: /g, '').replace(/\(auth\/.*\)\.?/g, '').trim() || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <Link to="/auth/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm tracking-widest uppercase font-semibold mb-8 group transition-colors" style={{ fontFamily: '"Outfit", sans-serif' }}>
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Login
      </Link>
      
      <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-2" style={{ fontFamily: '"Outfit", sans-serif' }}>
        Reset Password
      </h1>
      <p className="text-white/50 text-sm md:text-base mb-12 font-light leading-relaxed" style={{ fontFamily: '"Outfit", sans-serif' }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form className="space-y-8" onSubmit={handleReset}>
        <div>
          <label className="block text-white/70 text-xs font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Email Address
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={countdown > 0}
            placeholder="you@example.com"
            className="w-full bg-transparent border-b border-white/[0.15] pb-3 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-white transition-colors disabled:opacity-50"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          />
        </div>

        <button 
          type="button"
          onClick={countdown === 0 ? handleReset : undefined}
          disabled={isLoading || countdown > 0}
          className={`relative w-full mt-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden ${
            countdown > 0 || isLoading 
              ? 'bg-white/[0.08] text-white/60 cursor-not-allowed shadow-none' 
              : 'bg-white text-black hover:bg-white/90 active:scale-[0.98]'
          }`}
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          {/* Progress Line running across the bottom */}
          {countdown > 0 && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5">
              <div 
                className="h-full bg-[#c7ea46] transition-all duration-1000 ease-linear shadow-[0_0_10px_#c7ea46]"
                style={{ width: `${(countdown / 60) * 100}%` }}
              />
            </div>
          )}

          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : countdown > 0 ? (
            `Resend in ${countdown}s`
          ) : (
            'Send Reset Link'
          )}
        </button>

        {/* Return to Login - Appears after email is sent */}
        {emailSent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link 
              to="/auth/login" 
              className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all border border-white/10 hover:border-white/30 hover:bg-white/5 flex items-center justify-center text-white"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              Return to Login
            </Link>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
