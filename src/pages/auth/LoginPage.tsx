import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in! Welcome back.');
      navigate('/admin');
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'An unexpected error occurred.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message?.replace(/Firebase: /g, '').replace(/\(auth\/.*\)\.?/g, '').trim() || 'Failed to sign in.';
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
      <h1 className="text-4xl md:text-5xl text-white mb-2 font-heading font-light tracking-tighter" >
        Welcome Back
      </h1>
      <p className="text-white/50 text-sm md:text-base mb-12 font-light leading-relaxed" >
        Enter your details to access your account.
      </p>

      <form className="space-y-8" onSubmit={handleLogin}>
        <div>
          <label className="block text-white/70 text-xs font-semibold uppercase tracking-widest mb-3" >
            Email Address
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-transparent border-b border-white/[0.15] pb-3 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
            
          />
        </div>

        <div className="relative">
          <label className="block text-white/70 text-xs font-semibold uppercase tracking-widest mb-3" >
            Password
          </label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-white/[0.15] pb-3 pr-10 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
              
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mt-1.5 p-2 text-white/40 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <Link to="/auth/forgot-password" className="text-white/50 text-sm hover:text-white transition-colors underline underline-offset-4" >
            Forgot Password?
          </Link>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full mt-8 bg-white text-black py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-white/90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

    </motion.div>
  );
}
