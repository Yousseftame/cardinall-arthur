import { Link } from "react-router-dom";
import SpecularButton from "../../components/SpecularButton";
import { ArrowLeft } from "lucide-react";
import { DiaTextReveal } from "../../components/ui/dia-text-reveal";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Massive crafted 404 background watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[30vw] md:text-[35vw] leading-none font-bold text-white/[0.03] select-none pointer-events-none z-0 tracking-tighter">
        404
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-6xl mx-auto">
        <h1 className="font-heading text-4xl md:text-6xl lg:text-8xl xl:text-[100px] font-bold uppercase tracking-tight leading-[0.85] mb-12 whitespace-nowrap">
          <DiaTextReveal 
            text="PAGE NOT FOUND" 
            textColor="#ffffff" 
            colors={["#ffffff", "#ffffff", "transparent"]}
            duration={1.5}
            delay={0.2}
            once={true}
          />
        </h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>
            <SpecularButton 
              size="md"
              radius={14}
              tintOpacity={0}
              blur={12}
              baseColor="#52525b"
              className="!px-8 !py-4 text-xs md:text-sm tracking-widest font-bold uppercase !bg-gradient-to-br !from-white/10 !via-transparent !to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(255,255,255,0.1),0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:!from-white/15 hover:!via-white/5 hover:!to-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 text-white">
                <ArrowLeft className="w-4 h-4" />
                Return to Home
              </div>
            </SpecularButton>
          </Link>
        </motion.div>
      </div>

    </div>
  );
}
