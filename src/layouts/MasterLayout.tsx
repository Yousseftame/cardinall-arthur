import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css'; // Modern lenis provides default styles

import Navbar from '../components/layout/Navbar';
import CartSidebar from '../components/layout/CartSidebar';
import MenuSidebar from '../components/layout/MenuSidebar';
import ScrolledNavbar from '../components/layout/ScrolledNavbar';
import SplashScreen from '../components/layout/SplashScreen';
import FooterSection from '../components/sections/FooterSection';

export default function MasterLayout() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis for buttery smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll to top on every route change, through Lenis so it's respected
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      // Fallback if Lenis hasn't initialized yet
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isSplashComplete && (
          <SplashScreen key="splash" onComplete={() => setIsSplashComplete(true)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
        <Navbar />
        <ScrolledNavbar />
      <CartSidebar />
      <MenuSidebar />
      
      
      <main className="flex-grow">
        {/* Outlet renders the matched child route component */}
        <Outlet />
      </main>

      <FooterSection />
    </div>
    </>
  );
}
