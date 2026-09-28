import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import bag1 from '../../assets/690725e34cc7bc9a71464b6e_Elegant Black Handbag.avif';
import bag2 from '../../assets/6907260496f08def56838d36_Black Leather Handbag.avif';
import bag3 from '../../assets/69073d30b82ece2f5b69f07d_Beige Tote Bag Display.avif';

export default function ProductsSection() {
  const baseProducts = [
    { id: 1, name: "Sauné Bag", price: "150.00 EGP", image: bag1 },
    { id: 2, name: "Noé Carry Bag", price: "145.00 EGP", image: bag2 },
    { id: 3, name: "Maren Bag", price: "135.00 EGP", image: bag3 },
    { id: 4, name: "Lunet Bag", price: "175.00 EGP", image: bag1 },
    { id: 5, name: "Lévra Tote", price: "45.00 EGP", image: bag3 },
    { id: 6, name: "Classic Mini", price: "120.00 EGP", image: bag2 },
  ];

  // Render 3 sets to ensure we have plenty of overflow for seamless dragging
  const loopItems = [...baseProducts, ...baseProducts, ...baseProducts];

  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const isDragging = useRef(false);
  const isHovered = useRef(false);
  const lastXRef = useRef(0);

  // Calculate the width of exactly ONE base set of products
  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.scrollWidth / 3);
    }
    const handleResize = () => {
      if (trackRef.current) setTrackWidth(trackRef.current.scrollWidth / 3);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const wrapX = (newX: number) => {
    if (trackWidth === 0) return newX;
    let wrappedX = newX % trackWidth;
    if (wrappedX > 0) wrappedX -= trackWidth;
    return wrappedX;
  };

  // Smooth infinite auto-scroll
  useAnimationFrame((time, delta) => {
    // Pause if the user is dragging OR hovering
    if (isDragging.current || isHovered.current || trackWidth === 0) return;
    
    // Adjust scroll speed here (higher multiplier = faster)
    let moveBy = delta * 0.05;
    x.set(wrapX(x.get() - moveBy));
  });

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || trackWidth === 0) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    x.set(wrapX(x.get() + dx));
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  return (
    <section className="w-full bg-[#f8f7f3] text-[#1a1a1a] py-24 md:py-32 overflow-hidden">
      
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-20 px-8">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-[56px] font-light tracking-tighter mb-6 uppercase">
            <DiaTextReveal 
              text="CARRIED WITH INTENTION" 
              textColor="#1a1a1a"
              colors={["#1a1a1a", "#1a1a1a", "#1a1a1a"]}
            />
          </h2>
          <p 
            className="text-[#5a5a5a] text-sm md:text-base max-w-4xl font-light leading-relaxed tracking-wide"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, system-ui, -apple-system, sans-serif' }}
          >
            Soft structure, precise form, bags designed to hold more than what you carry.
          </p>
        </div>

        {/* Draggable Auto-Scrolling Product Track */}
        <div 
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerEnter={() => (isHovered.current = true)}
          onPointerLeave={() => {
            isHovered.current = false;
            isDragging.current = false; // Failsafe for drag state
          }}
        >
          <motion.div 
            ref={trackRef}
            style={{ x }}
            className="flex gap-8 md:gap-12 px-4 md:px-6 w-max touch-none"
          >
            
            {loopItems.map((product, idx) => (
              <div 
                key={`${product.id}-${idx}`} 
                className="flex flex-col items-center group w-[240px] md:w-[280px] lg:w-[18vw] flex-shrink-0"
                style={{ fontFamily: '"Outfit", sans-serif' }}
              >
                {/* Image Container */}
                <div className="w-full aspect-square mb-6 overflow-hidden bg-transparent flex items-center justify-center pointer-events-none">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                
                {/* Details */}
                <h3 className="font-medium text-base mb-1 group-hover:text-black/60 transition-colors">
                  {product.name}
                </h3>
                <p className="text-[#6a6a6a] text-sm tracking-wide">
                  {product.price}
                </p>
              </div>
            ))}
            
          </motion.div>
        </div>

        {/* Explore Button */}
        <div className="flex justify-center mt-20">
          <a href="#" className="font-heading uppercase text-sm font-semibold tracking-widest border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors duration-300">
            EXPLORE BAGS
          </a>
        </div>

      </div>
    </section>
  );
}
