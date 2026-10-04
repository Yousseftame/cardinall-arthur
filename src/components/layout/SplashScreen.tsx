import { useEffect, useState } from "react";
import { useSplashStore } from "../../store/splashStore";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"dot" | "line" | "text" | "fade">("dot");

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // 1. Initial sleep then Dot -> Line
    const t1 = setTimeout(() => setPhase("line"), 600);
    // 2. Line -> Reveal Text
    const t2 = setTimeout(() => setPhase("text"), 1400);
    // 3. Hold text then Fade/Rise the curtain
    const t3 = setTimeout(() => {
      setPhase("fade");
      useSplashStore.getState().setSplashVisible(false);
    }, 3000);
    // 4. Fully unmount component globally
    const t4 = setTimeout(() => {
      onComplete();
      document.body.style.overflow = '';
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-[#0a0a0a] flex items-center justify-center transition-transform duration-[800ms] ease-[cubic-bezier(0.65,0,0.05,1)] ${
        phase === "fade" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center w-full max-w-5xl h-64">
        {/* The Central Line/Dot */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-primary transition-all duration-[800ms] ease-[cubic-bezier(0.85,0,0.15,1)] z-10 ${
            phase === "dot"
              ? "w-[4px] h-[4px] rounded-full shadow-[0_0_15px_rgba(178,133,88,0.8)]"
              : phase === "line" || phase === "text"
                ? "w-[85%] sm:w-[600px] md:w-[800px] lg:w-[900px] h-[1px] shadow-[0_0_20px_rgba(178,133,88,0.5)]"
                : "w-[85%] sm:w-[600px] md:w-[800px] lg:w-[900px] h-[1px] opacity-0 shadow-none"
          }`}
        ></div>

        {/* Top Text: CARDINAL [LOGO] ARTHUR */}
        <div
          className={`absolute bottom-1/2 left-0 w-full flex justify-center items-end overflow-hidden transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase === "text" ? "h-32 opacity-100" : "h-0 opacity-0"
          }`}
        >
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 translate-y-1 pb-[6px]">
            <h1 
              className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading uppercase scale-y-[1.1] origin-bottom font-light tracking-tighter"
            >
              CARDINAL
            </h1>
            <img 
              src="/logo-removebg-preview.png" 
              alt="Logo" 
              className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto object-contain opacity-90"
            />
            <h1 
              className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading uppercase scale-y-[1.1] origin-bottom font-light tracking-tighter"
            >
              ARTHUR
            </h1>
          </div>
        </div>

      </div>
    </div>
  );
}
