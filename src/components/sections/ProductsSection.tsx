import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useAnimationFrame, AnimatePresence } from 'framer-motion';
import { Eye, ShoppingCart, X, Share2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import PulseHeart from '../PulseHeart';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import { PRODUCTS } from '../../data/products';
import { useCartStore } from '../../store/cartStore';
import { useFavoriteStore } from '../../store/favoriteStore';

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

export default function ProductsSection() {
  const navigate = useNavigate();
  const { addItem, openCart } = useCartStore();
  const { toggleItem: toggleFavorite, isFavorite } = useFavoriteStore();
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  // Render 3 sets to ensure we have plenty of overflow for seamless dragging
  const loopItems = [...PRODUCTS, ...PRODUCTS, ...PRODUCTS];

  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const isDragging = useRef(false);
  const isHovered = useRef(false);
  const velocity = useRef(0);
  const isDragged = useRef(false);

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

  // Smooth infinite auto-scroll with momentum
  useAnimationFrame((_time, delta) => {
    if (trackWidth === 0 || selectedProduct) return;
    
    let currentX = x.get();
    
    if (isDragging.current) {
      // onPan handles the drag
    } else {
      // Apply momentum
      if (Math.abs(velocity.current) > 0.02) {
        currentX += velocity.current * delta;
        velocity.current *= 0.95; // friction
      } else if (!isHovered.current) {
        // Standard auto scroll
        currentX -= delta * 0.05;
      }
    }
    
    x.set(wrapX(currentX));
  });

  const handlePanStart = () => {
    isDragging.current = true;
    velocity.current = 0;
  };

  const handlePan = (_e: any, info: any) => {
    if (Math.abs(info.offset.x) > 5) {
      isDragged.current = true;
    }
    x.set(wrapX(x.get() + info.delta.x));
  };

  const handlePanEnd = (_e: any, info: any) => {
    isDragging.current = false;
    velocity.current = info.velocity.x / 1000;
  };

  const handleAddToCart = (product: typeof PRODUCTS[0], qty = 1) => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id.toString(),
        name: product.name,
        price: parseFloat(product.price.replace(/[^0-9.-]+/g, "")),
        imageUrl: product.image,
        description: product.desc,
        stock: 99,
      });
    }
    openCart();
    setSelectedProduct(null);
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveImage((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = 1;
      if (next > 1) next = 0;
      return next;
    });
  };

  const openQuickView = (product: typeof PRODUCTS[0]) => {
    setQuantity(1);
    setActiveImage(0);
    setDirection(0);
    setIsShippingOpen(false);
    setSelectedProduct(product);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  // Auto-advance gallery inside Quick View
  useEffect(() => {
    if (!selectedProduct) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 4000); // 4 seconds duration to match Product Details
    return () => clearInterval(timer);
  }, [selectedProduct, activeImage]);

  return (
    <section className="w-full bg-[#f8f7f3] text-[#1a1a1a] py-24 md:py-32 overflow-hidden">
      
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-20 px-8">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-[56px] mb-6 uppercase font-light tracking-tighter">
            <DiaTextReveal 
              text="CARRIED WITH INTENTION" 
              textColor="#1a1a1a"
              colors={["#1a1a1a", "#1a1a1a", "#1a1a1a"]}
            />
          </h2>
          <p 
            className="text-[#5a5a5a] text-sm md:text-base max-w-4xl font-light leading-relaxed tracking-wide"
            
          >
            Soft structure, precise form, bags designed to hold more than what you carry.
          </p>
        </div>

        {/* Draggable Auto-Scrolling Product Track */}
        <div 
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing pb-4"
          onPointerDown={() => (isDragged.current = false)}
          onMouseEnter={() => (isHovered.current = true)}
          onMouseLeave={() => {
            isHovered.current = false;
            isDragging.current = false;
          }}
        >
          <motion.div 
            ref={trackRef}
            style={{ x }}
            className="flex gap-8 md:gap-12 px-4 md:px-6 w-max touch-pan-y"
            onPanStart={handlePanStart}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
          >
            
            {loopItems.map((product, idx) => (
              <div 
                key={`${product.id}-${idx}`} 
                className="flex flex-col items-center group w-[240px] md:w-[280px] lg:w-[18vw] flex-shrink-0 relative"
                
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square mb-6 overflow-hidden bg-transparent flex items-center justify-center pointer-events-none">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    draggable={false}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out cursor-pointer pointer-events-auto"
                    onClick={() => {
                      if (isDragged.current) return;
                      navigate(`/product/${product.id}`);
                    }}
                  />
                  
                  {/* Quick Action Pill (Always visible on mobile, hover on desktop) */}
                  <div className="absolute left-4 top-4 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-white/10 via-white/30 to-white/80 backdrop-blur-2xl rounded-full py-5 px-3.5 opacity-100 scale-100 md:opacity-0 md:scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400 ease-out pointer-events-auto z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openQuickView(product); }}
                      className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:scale-110 transition-all duration-300 flex items-center justify-center" aria-label="Quick view"
                    >
                      <Eye strokeWidth={1.5} className="w-[22px] h-[22px]" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:scale-110 transition-all duration-300 flex items-center justify-center" aria-label="Add to cart"
                    >
                      <ShoppingCart strokeWidth={1.5} className="w-[22px] h-[22px]" />
                    </button>
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center -m-2">
                      <PulseHeart 
                        liked={isFavorite(product.id.toString())}
                        onChange={() => {
                          toggleFavorite({
                            id: product.id.toString(),
                            name: product.name,
                            price: parseFloat(product.price.replace(/[^0-9.-]+/g, "")),
                            imageUrl: product.image,
                            description: product.desc,
                            stock: 99,
                          });
                        }}
                        showCount={false} 
                        size={22} 
                        pillColor="transparent" 
                        idleColor="rgba(26,26,26,0.7)" 
                        likedColor="#ff4d6d" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <h3 
                  className="text-base mb-1 group-hover:text-black/60 transition-colors font-medium cursor-pointer"
                  onClick={() => {
                    if (isDragged.current) return;
                    navigate(`/product/${product.id}`);
                  }}
                >
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
          <Link to="/marketplace" className="font-heading uppercase text-sm font-semibold tracking-widest border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors duration-300">
            EXPLORE SHOP
          </Link>
        </div>

      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#2C0E11]/40 backdrop-blur-sm z-50 overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
              data-lenis-prevent
              onClick={() => setSelectedProduct(null)}
            >
              <div className="min-h-full w-full flex items-center justify-center p-4 py-12 md:p-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-[#2C0E11] w-full max-w-4xl rounded-[2.5rem] flex flex-col md:flex-row relative max-h-none md:max-h-[85vh] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-11 h-11 bg-[#2C0E11]/10 md:bg-white/10 hover:bg-[#2C0E11]/20 md:hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-black md:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="w-full md:w-1/2 bg-white relative flex flex-col items-center justify-start md:justify-center p-6 md:p-10 pt-16 md:pt-10 shrink-0 min-h-[350px] md:min-h-[400px] rounded-t-[2.5rem] md:rounded-l-[2.5rem] md:rounded-tr-none">
                    <div className="w-full aspect-square md:h-[400px] flex items-center justify-center relative mb-6 overflow-hidden">
                      <AnimatePresence initial={false} custom={direction}>
                        <motion.img 
                          key={activeImage}
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
                          src={[selectedProduct.image, selectedProduct.hoverImage][activeImage]} 
                          alt={selectedProduct.name} 
                          className="absolute w-full h-full object-contain max-h-[280px] md:max-h-[380px] cursor-grab active:cursor-grabbing"
                        />
                      </AnimatePresence>
                    </div>
                    {/* Thumbnails */}
                    <div className="flex gap-4">
                      {[selectedProduct.image, selectedProduct.hoverImage].map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            setDirection(idx > activeImage ? 1 : -1);
                            setActiveImage(idx);
                          }}
                          className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-colors shrink-0 ${activeImage === idx ? 'border-[#0a0a0a]' : 'border-transparent hover:border-[#0a0a0a]/30'}`}
                        >
                          <img src={img} alt="Thumbnail" className="w-full h-full object-contain p-1" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div 
                    className="w-full md:w-1/2 p-6 md:p-12 pt-12 md:pt-24 flex flex-col justify-center overflow-visible md:overflow-y-auto [&::-webkit-scrollbar]:hidden relative"
                    style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                    data-lenis-prevent
                  >
                    <div className="absolute top-4 left-6 md:top-6 md:left-12 z-20 flex items-center gap-2">
                      <div className="relative">
                        <button 
                          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                          aria-label="Share product"
                          onClick={() => setIsShareOpen(!isShareOpen)}
                        >
                          <Share2 className="w-[22px] h-[22px]" strokeWidth={1.5} />
                        </button>
                        
                        <AnimatePresence>
                          {isShareOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsShareOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute left-0 top-full mt-2 w-56 bg-white rounded-[16px] shadow-2xl py-2 z-50 flex flex-col font-sans"
                              >
                                <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#1a1a1a] hover:bg-gray-100 transition-colors w-full text-left" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard!'); setIsShareOpen(false); }}>
                                  <Copy className="w-[18px] h-[18px] text-[#5a5a5a]" strokeWidth={2} />
                                  Copy link
                                </button>
                                <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#1a1a1a] hover:bg-gray-100 transition-colors w-full text-left" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(selectedProduct.name + ' - ' + window.location.href)}`, '_blank'); setIsShareOpen(false); }}>
                                  <svg className="w-[18px] h-[18px] text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                  </svg>
                                  Share on WhatsApp
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors relative">
                        <div className="absolute inset-0 flex items-center justify-center -ml-[2px] -mt-[1px]">
                          <PulseHeart 
                            liked={isFavorite(selectedProduct.id.toString())}
                            onChange={() => toggleFavorite({
                              id: selectedProduct.id.toString(),
                              name: selectedProduct.name,
                              price: parseFloat(selectedProduct.price.replace(/[^0-9.-]+/g, "")),
                              imageUrl: selectedProduct.image,
                              description: selectedProduct.desc,
                              stock: 99,
                            })}
                            showCount={false} 
                            size={20} 
                            pillColor="transparent" 
                            idleColor="currentColor" 
                            likedColor="#ff4d6d" 
                          />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-3xl md:text-4xl text-white font-medium mb-4 mt-2 md:mt-0">
                      <DiaTextReveal
                        text={selectedProduct.name}
                        textColor="#ffffff"
                        colors={["#ffffff", "#ffffff", "transparent"]}
                        once={true}
                      />
                    </h3>
                    <div className="text-xl md:text-2xl text-white/90 font-semibold mb-6">
                      {selectedProduct.price}
                    </div>
                    <p className="text-white/60 text-base leading-relaxed mb-6">
                      {selectedProduct.desc}
                    </p>

                    {/* Shipping Accordion */}
                    <div className="mb-8 w-full border-b border-white/20">
                      <button 
                        onClick={() => setIsShippingOpen(!isShippingOpen)}
                        className="w-full flex items-center justify-between py-4 text-white"
                      >
                        <span className="font-bold uppercase tracking-wider text-sm">
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
                              <div className="text-white/60 text-sm leading-relaxed">
                                Free standard shipping on all orders over 5,000 EGP. Returns accepted within 14 days of delivery. Custom items are final sale.
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto pb-4 md:pb-0">
                      <div className="flex items-center gap-4 w-full sm:w-auto self-start sm:self-auto">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                          className="w-12 h-12 rounded-full border-[1.5px] border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                        >
                          <span className="text-xl font-light leading-none mb-1">-</span>
                        </button>
                        <span className="text-white text-xl font-medium w-4 text-center select-none">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)} 
                          className="w-12 h-12 rounded-full border-[1.5px] border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                        >
                          <span className="text-xl font-light leading-none mb-1">+</span>
                        </button>
                      </div>
                      
                      <motion.button 
                        onClick={() => handleAddToCart(selectedProduct, quantity)} 
                        className="w-full sm:flex-1 bg-white text-black py-4 px-6 rounded-xl font-bold uppercase tracking-wider text-sm sm:text-base hover:bg-gray-200 transition-colors shrink-0 text-center"
                        whileTap={{ scale: 0.98 }}
                      >
                        ADD TO CART
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
