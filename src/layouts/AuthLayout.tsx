import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import authImg from '../assets/auth.avif';

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex bg-[#2C0E11] text-white overflow-hidden">
      {/* Left Side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={authImg} 
          alt="Authentication" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#2C0E11]/20" />
        
        {/* Logo over image */}
        <div className="absolute top-12 left-12">
          <Link to="/" className="font-heading text-2xl font-medium tracking-[0.15em] uppercase text-white hover:text-white/80 transition-colors">
            Cardinal Arthur
          </Link>
        </div>
      </div>

      {/* Right Side: Form Content */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-[#2C0E11] min-h-screen">
        {/* Back Button (Mobile) */}
        <div className="absolute top-8 left-6 lg:hidden z-10">
          <Link to="/" className="p-2 -ml-2 text-white hover:text-white/70 transition-colors block">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>
        
        {/* Back to Home (Desktop top-right) */}
        <div className="absolute top-10 right-12 hidden lg:block z-10">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white/50 hover:text-white transition-colors group"
            
          >
            <span>Back to Store</span>
            <ArrowLeft className="w-4 h-4 rotate-180 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24 xl:px-32 w-full max-w-2xl mx-auto py-24">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
