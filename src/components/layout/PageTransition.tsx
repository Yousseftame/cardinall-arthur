import { useEffect, useState } from 'react';

interface PageTransitionProps {
  onComplete?: () => void;
}

export default function PageTransition({ onComplete }: PageTransitionProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // 680ms total animation duration (150ms delay + 520ms animation)
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, 700);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Layer 1: Near black */}
      <div className="curtain-layer curtain-layer-1" />
      {/* Layer 2: Charcoal */}
      <div className="curtain-layer curtain-layer-2" />
      {/* Layer 3: Near black */}
      <div className="curtain-layer curtain-layer-3" />
    </div>
  );
}
