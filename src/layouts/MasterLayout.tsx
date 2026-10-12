import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useLayoutEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import Navbar from '../components/layout/Navbar';
import CartSidebar from '../components/layout/CartSidebar';
import MenuSidebar from '../components/layout/MenuSidebar';
import SearchOverlay from '../components/layout/SearchOverlay';
import SplashScreen from '../components/layout/SplashScreen';
import WelcomeModal from '../components/layout/WelcomeModal';
import FooterSection from '../components/sections/FooterSection';
import { preloadHeroImages } from '../utils/preloadAssets';

// Enforce manual scroll restoration so browser never restores or maintains previous scroll offset
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default function MasterLayout() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Preload hero images in background for instant reveals
    preloadHeroImages();
  }, []);

  // Synchronously reset scroll BEFORE the browser paints the new route.
  // This completely eliminates any 1-frame flash of the previous page's scroll position (e.g. Client Feedback).
  useLayoutEffect(() => {
    if (location.state?.scrollTo || location.state?.scrollToProducts) {
      return;
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isSplashComplete && (
          <SplashScreen key="splash" onComplete={() => setIsSplashComplete(true)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col relative bg-transparent font-sans text-foreground">
        <div className="luxury-stage" aria-hidden="true" />
        <Navbar />
        <CartSidebar />
        <MenuSidebar />
        <SearchOverlay />
        <WelcomeModal />

        <main className="relative z-[1] flex-grow">
          <Outlet />
        </main>

        <div className="relative z-[1]">
          <FooterSection />
        </div>
      </div>
    </>
  );
}
