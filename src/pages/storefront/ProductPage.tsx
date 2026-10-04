import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiaTextReveal } from '../../components/ui/dia-text-reveal';
import FAQSection from '../../components/sections/FAQSection';
import { useCartStore } from '../../store/cartStore';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const imageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    filter: 'blur(4px)',
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    filter: 'blur(4px)',
    scale: 1.02
  })
};

export default function ProductPage() {
  const { id } = useParams();
  const product = PRODUCTS.find((p) => p.id === Number(id)) || PRODUCTS[0];
  
  // Since we only have two images (image and hoverImage) in mock data, let's just make a simple gallery.
  const gallery = [product.image, product.hoverImage, product.image, product.hoverImage]; // Mock 4 thumbnails
  const [activeImage, setActiveImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const { addItem, openCart } = useCartStore();

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveImage((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = gallery.length - 1;
      if (next >= gallery.length) next = 0;
      return next;
    });
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: parseFloat(product.price.replace(/[^0-9.-]+/g, "")),
      imageUrl: product.image,
      description: product.desc,
      stock: 99,
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        
        {/* Left: Image Gallery */}
        <div className="relative w-full min-h-[400px] md:min-h-[600px] bg-white rounded-[2rem] flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden group">
          {/* Main Image */}
          <div className="w-full aspect-square md:h-full flex items-center justify-center relative mb-8 overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.img 
                key={activeImage}
                src={gallery[activeImage]} 
                alt={product.name}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  } else {
                    if (offset.x < -50) paginate(1);
                    else if (offset.x > 50) paginate(-1);
                  }
                }}
                className="absolute inset-0 w-full h-full object-contain cursor-grab active:cursor-grabbing"
              />
            </AnimatePresence>
          </div>
          
          {/* Thumbnails */}
          <div className="flex gap-4 z-10 flex-wrap justify-center">
            {gallery.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setDirection(idx > activeImage ? 1 : -1);
                  setActiveImage(idx);
                }}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-[1.5px] md:border-2 transition-colors shrink-0 ${activeImage === idx ? 'border-[#0a0a0a]' : 'border-transparent hover:border-[#0a0a0a]/30'}`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col pt-4 lg:pt-8">
          <Link 
            to="/marketplace" 
            className="inline-flex items-center gap-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-white hover:opacity-50 transition-opacity mb-8 group" 
            
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5] transition-transform group-hover:-translate-x-1" />
            BACK TO OVERVIEW
          </Link>
          
          <h1 
            className="text-[48px] md:text-[64px] leading-[1.05] text-white mb-6 font-medium"
            
          >
            <DiaTextReveal
              text={product.name}
              textColor="#ffffff"
              colors={["#ffffff", "#ffffff", "transparent"]}
              once={true}
            />
          </h1>

          <div 
            className="text-3xl md:text-[40px] font-semibold text-white mb-10 tracking-tight"
            
          >
            {product.price}
          </div>

          <p 
            className="text-white/70 text-lg md:text-xl leading-relaxed mb-12 max-w-xl font-medium"
            
          >
            {product.desc}
          </p>

          {/* Shipping Accordion */}
          <div className="mt-4 mb-10 w-full border-b border-white/20">
            <button 
              onClick={() => setIsShippingOpen(!isShippingOpen)}
              className="w-full flex items-center justify-between py-4 text-white"
            >
              <span className="font-bold uppercase tracking-wider text-lg" >
                SHIPPING & RETURNS
              </span>
              <div className="relative w-4 h-4 flex items-center justify-center">
                <span className="absolute w-[14px] h-[2px] bg-current" />
                <motion.span 
                  className="absolute h-[14px] w-[2px] bg-current"
                  animate={{ rotate: isShippingOpen ? 90 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isShippingOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="pb-6 pt-2"
                  >
                    <div className="text-white/60 text-sm leading-relaxed" >
                      Free standard shipping on all orders over 5,000 EGP. Returns accepted within 14 days of delivery. Custom items are final sale.
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quantity and Add to Cart Button */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-6 self-start sm:self-auto">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="w-14 h-14 rounded-full border-[1.5px] border-white text-white flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
              >
                <span className="text-2xl font-light leading-none mb-1">-</span>
              </button>
              <span 
                className="text-white text-2xl font-medium w-4 text-center select-none"
                
              >
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                className="w-14 h-14 rounded-full border-[1.5px] border-white text-white flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
              >
                <span className="text-2xl font-light leading-none mb-1">+</span>
              </button>
            </div>
            
            <motion.button 
              onClick={handleAddToCart} 
              className="w-full sm:flex-1 bg-white text-black py-4 px-8 rounded-xl font-bold uppercase tracking-wider text-xl relative overflow-hidden"
              
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 12px 32px -8px rgba(0,0,0,0.45)'
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              ADD TO CART
            </motion.button>
          </div>
        </div>

      </div>

      {/* ── You May Also Like ── */}
      <YouMayAlsoLike currentId={product.id} />

      {/* ── FAQ Section ── */}
      <FAQSection />
    </div>
  );
}

/* ─── You May Also Like Component ─────────────────────────── */
function YouMayAlsoLike({ currentId }: { currentId: number }) {
  const related = PRODUCTS.filter((p) => p.id !== currentId);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const isDragging = React.useRef(false);
  const didDrag = React.useRef(false); // stays true through the post-drag click
  const autoplayPauseRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickBlockRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const GAP = 12;
  const maxIdx = Math.max(0, related.length - visibleCount);

  // Measure container to compute exact card width
  React.useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const v = window.innerWidth < 768 ? 1 : (window.innerWidth < 1024 ? 2 : 3);
        setVisibleCount(v);
        const total = containerRef.current.offsetWidth;
        setCardW((total - GAP * (v - 1)) / v);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Auto-play — pauses when isDragging ref is true
  React.useEffect(() => {
    if (maxIdx <= 0) return;
    const timer = setInterval(() => {
      if (!isDragging.current) {
        setActiveIdx((i) => (i >= maxIdx ? 0 : i + 1));
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [maxIdx]);

  const goTo = (idx: number) => setActiveIdx(Math.max(0, Math.min(maxIdx, idx)));
  const prev = () => goTo(activeIdx - 1);
  const next = () => goTo(activeIdx + 1);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    isDragging.current = false;
    const step = cardW + GAP;
    const swipeThreshold = step * 0.2;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -300) {
      goTo(activeIdx + 1);
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 300) {
      goTo(activeIdx - 1);
    }
    // Keep didDrag=true long enough to block the imminent click event
    if (clickBlockRef.current) clearTimeout(clickBlockRef.current);
    clickBlockRef.current = setTimeout(() => { didDrag.current = false; }, 150);
    // Resume autoplay after 3s of idle
    if (autoplayPauseRef.current) clearTimeout(autoplayPauseRef.current);
    autoplayPauseRef.current = setTimeout(() => { isDragging.current = false; }, 3000);
  };

  return (
    <section className="mt-48 pb-24 max-w-[1400px] mx-auto px-4 md:px-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 gap-4">
        <h2
          className="text-4xl md:text-5xl text-white font-medium"
        >
          <DiaTextReveal
            text="You may also like"
            textColor="#ffffff"
            colors={["#ffffff", "#ffffff", "transparent"]}
            once={true}
          />
        </h2>
        <Link
          to="/marketplace"
          className="shrink-0 whitespace-nowrap inline-flex items-center gap-2 bg-white text-black text-xs md:text-sm font-bold uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-white/90 transition-colors"
        >
          VIEW ALL
        </Link>
      </div>

      {/* Carousel — outer wrapper is relative only, overflow-hidden only on track */}
      <div className="relative">

        {/* Left Arrow — outside the track, floating left */}
        <div
          className="absolute left-0 z-10 hidden md:block"
          style={{ top: cardW > 0 ? cardW * 0.6 : '38%', transform: 'translateX(calc(-100% - 8px)) translateY(-50%)' }}
        >
          <div className="bg-[#0a0a0a] p-1.5 rounded-full">
            <button
              onClick={prev}
              disabled={activeIdx === 0}
              className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Draggable Track — only this clips overflow */}
        <div className="overflow-hidden" ref={containerRef}>
          {cardW > 0 && (
            <motion.div
              className="flex cursor-grab active:cursor-grabbing select-none"
              style={{ gap: GAP, touchAction: 'pan-y' }}
              animate={{ x: -(activeIdx * (cardW + GAP)) }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: -(maxIdx * (cardW + GAP)), right: 0 }}
              dragElastic={0.08}
              onDragStart={() => { isDragging.current = true; didDrag.current = true; }}
              onDragEnd={handleDragEnd}
            >
              {related.map((p) => (
                <div
                  key={p.id}
                  className="flex-shrink-0"
                  style={{ width: cardW }}
                >
                  <Link
                    to={`/product/${p.id}`}
                    className="block group"
                    draggable={false}
                    onClick={(e) => {
                      if (didDrag.current) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {/* Image */}
                    <div
                      className="relative bg-white rounded-2xl overflow-hidden mb-4 group/image"
                      style={{ height: cardW * 1.2 }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-contain p-6 md:p-8 transition-opacity duration-500 group-hover/image:opacity-0 pointer-events-none"
                      />
                      <img
                        src={p.hoverImage}
                        alt={p.name}
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-contain p-6 md:p-8 opacity-0 transition-opacity duration-500 group-hover/image:opacity-100 pointer-events-none"
                      />
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 md:top-3 md:right-4 bg-[#0a0a0a] text-white w-16 h-16 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center z-10 shadow-lg">
                        <span className="font-semibold text-[13px] tracking-wide text-center leading-none flex flex-col items-center justify-center gap-0.5">
                          <span>{p.price.replace(' EGP', '')}</span>
                          <span className="text-[9px] text-white/70">EGP</span>
                        </span>
                      </div>
                    </div>
                    {/* Name + Desc */}
                    <h3
                      className="text-2xl text-white group-hover:text-white/50 transition-colors mb-1.5 font-medium"
                      
                    >
                      {p.name}
                    </h3>
                    <p
                      className="text-white/60 text-sm leading-relaxed"
                      
                    >
                      {p.desc}
                    </p>
                  </Link>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right Arrow — outside the track, floating right */}
        <div
          className="absolute right-0 z-10 hidden md:block"
          style={{ top: cardW > 0 ? cardW * 0.6 : '38%', transform: 'translateX(calc(100% + 8px)) translateY(-50%)' }}
        >
          <div className="bg-[#0a0a0a] p-1.5 rounded-full">
            <button
              onClick={next}
              disabled={activeIdx >= maxIdx}
              className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
