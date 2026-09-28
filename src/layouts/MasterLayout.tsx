import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css'; // Modern lenis provides default styles

import Navbar from '../components/layout/Navbar';

export default function MasterLayout() {
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

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      
      <main className="flex-grow">
        {/* Outlet renders the matched child route component */}
        <Outlet />
      </main>

      {/* Replace with your actual Footer component later */}
      <footer className="p-6 bg-secondary text-secondary-foreground text-center border-t border-border mt-auto">
        <p className="font-heading">© 2026 Cardinal Arthur Perfumes. All rights reserved.</p>
      </footer>
    </div>
  );
}
