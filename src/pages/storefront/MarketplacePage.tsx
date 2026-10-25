import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { AnimatePresence, motion, animate, type Variants, useScroll, useTransform, useMotionValue, useAnimationFrame } from 'framer-motion';
import { DiaTextReveal } from '../../components/ui/dia-text-reveal';
import marketplaceImg from '../../assets/marketplace1.webp';
import PageTransition from '../../components/layout/PageTransition';
import NotePicker from '../../components/perfume/NotePicker';
import PerfumeMatchResults from '../../components/perfume/PerfumeMatchResults';
import SpecularButton from '../../components/SpecularButton';
import { useProducts } from '../../hooks/useProducts';
import { matchProductsByNotes } from '../../lib/matchProductsByNotes';
import {
  MAX_USER_SELECTED_NOTES,
  normalizePerfumeNoteIds,
  resolveNoteLabel,
} from '../../data/perfumeNotes';
import { usePerfumeNotes } from '../../hooks/usePerfumeNotes';

type NotesPhase = 'select' | 'composing' | 'results';
const NOTES_COMPOSE_MS = 1400;
const NOTES_EASE = [0.22, 1, 0.36, 1] as const;
const glassBtnClass =
  '!px-7 !py-3 md:!px-8 md:!py-3.5 text-xs tracking-[0.18em] font-bold uppercase !rounded-full !bg-gradient-to-br !from-white/15 !via-white/5 !to-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(255,255,255,0.08),0_8px_28px_-10px_rgba(0,0,0,0.55)] hover:!from-white/22 hover:!via-white/8 hover:!to-white/12 transition-all duration-300 cursor-pointer';

const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.25,
    },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useFavoriteStore } from '../../store/favoriteStore';
import { PRODUCTS } from '../../data/products';
import FAQSection from '../../components/sections/FAQSection';
import CardinalArthurClubSection from '../../components/sections/CardinalArthurClubSection';
import { useMarketplaceBanners } from '../../hooks/useMarketplaceBanners';
import {
  resolveMarketplaceBannerImage,
  splitBannerHeading,
} from '../../data/marketplaceBannerImages';
import { Eye, ShoppingCart, X, Share2, Copy, ArrowRight } from 'lucide-react';
import PulseHeart from '../../components/PulseHeart';
import { useCartStore } from '../../store/cartStore';
import { capPickerQuantity, useCartLimit } from '../../hooks/useCartLimit';
import {
  notifyQuantityLimit,
  QuantityLimitNote,
} from '../../components/cart/QuantityLimitNote';
import toast from 'react-hot-toast';
import { getCategories } from '../../services/categories.service';


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

/** Whole-frame banner slide — transform-only spring (no opacity/blur/scale) */
const BANNER_GAP = 16;
const BANNER_SPRING = { type: 'spring' as const, stiffness: 280, damping: 32, mass: 0.85 };

export default function MarketplacePage() {
  const { data: bannerRecords = [] } = useMarketplaceBanners();
  const banners = useMemo(
    () =>
      bannerRecords.map((b) => ({
        id: b.id,
        image: resolveMarketplaceBannerImage(b.imageKey),
        pill: b.name,
        title: splitBannerHeading(b.heading),
        subtitle: b.description,
      })),
    [bannerRecords]
  );
  const bannerCount = banners.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const isBannerDragging = useRef(false);
  const bannerViewportRef = useRef<HTMLDivElement>(null);
  const [bannerWidth, setBannerWidth] = useState(0);
  const bannerX = useMotionValue(0);
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { data: catalogProducts = [], isLoading: catalogLoading } = useProducts();

  // Categories load only on marketplace visit (shared cache with admin)
  const { data: categoryRecords = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const categories = [
    'ALL',
    ...categoryRecords
      .filter((c) => c.status === 'active')
      .map((c) => c.name.trim().toUpperCase())
      .filter(Boolean),
  ];

  const { notes: noteCatalog } = usePerfumeNotes();
  const noteLabelCatalog = noteCatalog.map((n) => ({ id: n.slug, label: n.label }));

  const notesFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('notes') || '';
    return normalizePerfumeNoteIds(raw.split(',').filter(Boolean), MAX_USER_SELECTED_NOTES);
  }, [location.search]);

  const notesUrlKey = notesFromUrl.join(',');

  const [draftNotes, setDraftNotes] = useState<string[]>(notesFromUrl);
  const [committedNotes, setCommittedNotes] = useState<string[]>(notesFromUrl);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [notesPhase, setNotesPhase] = useState<NotesPhase>(
    notesFromUrl.length > 0 ? 'results' : 'select'
  );

  const writeNotesToUrl = useCallback(
    (next: string[]) => {
      const params = new URLSearchParams(location.search);
      if (next.length > 0) params.set('notes', next.join(','));
      else params.delete('notes');
      const qs = params.toString();
      navigate({ pathname: '/marketplace', search: qs ? `?${qs}` : '' }, { replace: true });
    },
    [location.search, navigate]
  );

  // Deep-link / home “Marketplace” CTA — sync committed notes from URL
  useEffect(() => {
    if (notesFromUrl.length > 0) {
      setDraftNotes(notesFromUrl);
      setCommittedNotes(notesFromUrl);
      setNotesPhase((p) => (p === 'composing' ? p : 'results'));
      setNotesPanelOpen(false);
      return;
    }
    setDraftNotes([]);
    setCommittedNotes([]);
    setNotesPhase('select');
  }, [notesUrlKey, notesFromUrl]);

  useEffect(() => {
    if (notesPhase !== 'composing') return;
    const t = setTimeout(() => setNotesPhase('results'), NOTES_COMPOSE_MS);
    return () => clearTimeout(t);
  }, [notesPhase]);

  const noteMatches = useMemo(() => {
    let list = matchProductsByNotes(catalogProducts, committedNotes);
    if (activeCategory !== 'ALL') {
      list = list.filter(
        (m) => m.product.categoryName.trim().toUpperCase() === activeCategory
      );
    }
    return list;
  }, [catalogProducts, committedNotes, activeCategory]);

  const handleRevealMatches = () => {
    if (draftNotes.length < 1 || notesPhase === 'composing') return;
    setNotesPanelOpen(false);
    setCommittedNotes(draftNotes);
    setNotesPhase('composing');
    writeNotesToUrl(draftNotes);
  };

  const handleClearDraftNotes = () => {
    setDraftNotes([]);
  };

  const handleStartOverNotes = () => {
    setDraftNotes([]);
    setCommittedNotes([]);
    writeNotesToUrl([]);
    setNotesPhase('select');
    setNotesPanelOpen(true);
  };

  useEffect(() => {
    if (activeCategory !== 'ALL' && !categories.includes(activeCategory)) {
      setActiveCategory('ALL');
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (location.state?.scrollToProducts) {
      setTimeout(() => {
        const productsElement = document.getElementById('products-section');
        if (productsElement) {
          productsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (notesFromUrl.length > 0) {
      setTimeout(() => {
        document.getElementById('make-your-perfume')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 400);
    }
  }, []);

  const { addItem, openCart } = useCartStore();
  const { toggleItem: toggleFavorite, isFavorite } = useFavoriteStore();
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const isDragging = useRef(false);
  const isHovered = useRef(false);
  const velocity = useRef(0);
  const isDragged = useRef(false);

  const loopItems = [...PRODUCTS, ...PRODUCTS, ...PRODUCTS];

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

  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  // Measure before paint so the track never lays out with unknown slide widths
  useLayoutEffect(() => {
    const el = bannerViewportRef.current;
    if (!el) return;
    const measure = () => setBannerWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bannerOffset = bannerWidth > 0 ? -currentIndex * (bannerWidth + BANNER_GAP) : 0;

  // Drive the track with a motion value so cancelled drags always spring home
  useEffect(() => {
    if (isBannerDragging.current) return;
    const controls = animate(bannerX, bannerOffset, BANNER_SPRING);
    return () => controls.stop();
  }, [bannerOffset, bannerX]);

  // Keep carousel index valid when banner list changes
  useEffect(() => {
    if (bannerCount === 0) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((prev) => (prev >= bannerCount ? 0 : prev));
  }, [bannerCount]);

  const paginateBanner = (dir: number) => {
    if (bannerCount === 0) return;
    setCurrentIndex((prev) => (prev + dir + bannerCount) % bannerCount);
  };

  const goToBanner = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  // Auto-advance; pause while dragging
  useEffect(() => {
    if (bannerCount <= 1) return;
    const timer = setInterval(() => {
      if (isBannerDragging.current) return;
      setCurrentIndex((prev) => (prev + 1) % bannerCount);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, bannerCount]);

  const selectedLimit = useCartLimit(selectedProduct?.id);
  const showLimitNote =
    selectedLimit.isAtMax ||
    (selectedLimit.remainingQuantity > 0 &&
      quantity >= selectedLimit.remainingQuantity);

  useEffect(() => {
    setQuantity((prev) =>
      capPickerQuantity(prev, selectedLimit.remainingQuantity)
    );
  }, [selectedLimit.remainingQuantity]);

  const handleAddToCart = (product: typeof PRODUCTS[0], qty = 1) => {
    const result = addItem(
      {
        id: product.id.toString(),
        name: product.name,
        price: parseFloat(product.price.replace(/[^0-9.-]+/g, "")),
        imageUrl: product.image,
        description: product.desc,
        stock: 99,
      },
      qty
    );
    if (result.status === 'maxed') {
      notifyQuantityLimit(product.name);
      return;
    }
    if (result.status === 'partial') {
      notifyQuantityLimit(product.name);
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
    }, 4000);
    return () => clearInterval(timer);
  }, [selectedProduct, activeImage]);

  return (
    <>
      <PageTransition />

      {/* Hero Section */}
      <div ref={containerRef} className="relative w-full min-h-screen bg-[#06114f] overflow-hidden flex items-center justify-center">
        {/* Scroll Parallax Wrapper */}
        <motion.div 
          className="absolute inset-0 w-full h-[115%] -top-[7%] origin-top pointer-events-none transform-gpu will-change-transform"
          style={{ y, scale: scrollScale }}
        >
          {/* Hardware-Accelerated Hero Image */}
          <motion.img 
            src={marketplaceImg} 
            alt="Marketplace Hero" 
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center select-none transform-gpu will-change-transform"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
          />
        </motion.div>
        
        {/* Original Electric Blue Overlays */}
        <div className="absolute inset-0 bg-[#071871]/40 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply pointer-events-none" />

        {/* Main Text Content */}
        <div className="relative z-10 w-full px-4 flex justify-center items-center">
          <motion.h1 
            className="text-[18vw] md:text-[220px] leading-none text-white flex items-center justify-center font-heading font-medium tracking-tight whitespace-nowrap overflow-hidden py-4"
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {"SHOP".split("").map((letter, i) => (
              <motion.span key={i} variants={letterVariants} className="inline-block">
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}

          </motion.h1>
        </div>
      </div>

      <div className="bg-transparent min-h-screen pt-32 pb-20 overflow-x-hidden text-white">
      
      {/* 1. Banner Carousel — whole framed cards slide on a transform-only spring track */}
      <section className="px-4 md:px-8 w-full max-w-[1920px] mx-auto mb-20 mt-4">
        <div
          ref={bannerViewportRef}
          className="relative w-full overflow-hidden touch-pan-y select-none"
        >
          <motion.div
            className="flex will-change-transform cursor-grab active:cursor-grabbing"
            style={{ x: bannerX, gap: BANNER_GAP, touchAction: 'pan-y' }}
            drag={bannerWidth > 0 ? 'x' : false}
            dragConstraints={{
              left: -Math.max(0, bannerCount - 1) * (bannerWidth + BANNER_GAP),
              right: 0,
            }}
            dragElastic={0.14}
            dragMomentum={false}
            onDragStart={() => {
              isBannerDragging.current = true;
            }}
            onDragEnd={(_e, { offset, velocity }) => {
              isBannerDragging.current = false;
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold || offset.x < -bannerWidth * 0.18) {
                paginateBanner(1);
              } else if (swipe > swipeConfidenceThreshold || offset.x > bannerWidth * 0.18) {
                paginateBanner(-1);
              } else {
                animate(bannerX, bannerOffset, BANNER_SPRING);
              }
            }}
          >
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="relative h-[50vh] min-h-[400px] md:h-[500px] lg:h-[550px] rounded-[24px] md:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl transform-gpu"
                style={{
                  flex: bannerWidth > 0 ? `0 0 ${bannerWidth}px` : '0 0 100%',
                  width: bannerWidth > 0 ? bannerWidth : '100%',
                }}
              >
                <img
                  src={banner.image}
                  alt=""
                  draggable={false}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                  loading="eager"
                />

                <div className="absolute inset-0 bg-[#0E1011]/30 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-[#0E1011]/80 border border-white/10 rounded-full px-5 py-2 md:px-6 md:py-2.5 shadow-xl flex items-center justify-center pointer-events-none">
                  <span className="font-heading font-bold text-white text-sm md:text-lg tracking-wider uppercase mt-0.5">
                    {banner.pill}
                  </span>
                </div>

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-4 -skew-x-[12deg] pointer-events-none">
                  <h2
                    className="font-heading text-white uppercase text-5xl md:text-7xl lg:text-[84px] xl:text-[96px] leading-[0.85] flex flex-col items-center scale-x-105 font-light tracking-tighter"
                    style={{ textShadow: '0 10px 20px rgba(0,0,0,0.6)' }}
                  >
                    {banner.title.map((line, lineIdx) => (
                      <span key={`${banner.id}-${lineIdx}-${line}`}>{line}</span>
                    ))}
                  </h2>
                </div>

                <div className="absolute bottom-10 md:bottom-12 left-0 right-0 z-10 px-4 flex justify-center pointer-events-none">
                  <p className="text-white/80 font-light text-sm md:text-base lg:text-lg max-w-xl text-center drop-shadow-lg">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Dots stay fixed over the viewport while cards slide underneath */}
          {bannerCount > 0 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20 pointer-events-auto">
              {banners.map((banner, i) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => goToBanner(i)}
                  className={`transition-[width,background-color] duration-300 ease-out rounded-full cursor-pointer ${
                    i === currentIndex ? 'w-8 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. Products Section */}
      <section id="products-section" className="px-4 md:px-12 w-full max-w-[1920px] mx-auto scroll-mt-24">
        <div className="flex flex-col mb-6 mt-16 md:mt-24">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-[56px] uppercase mb-8 font-light tracking-tighter">
            <DiaTextReveal 
              text="THE COLLECTION" 
              textColor="#ffffff" 
              colors={["#ffffff", "#ffffff", "transparent"]} 
            />
          </h2>
          
          {/* Category Filter */}
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto scrollbar-hide w-full" >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-sm md:text-base uppercase transition-colors whitespace-nowrap tracking-wide ${
                  activeCategory === category 
                    ? 'text-white font-bold' 
                    : 'text-white/40 font-medium hover:text-white/70'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Draggable Auto-Scrolling Product Track */}
        <div 
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing pb-12 mt-4"
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
                <div className="relative w-full aspect-[4/5] md:aspect-square mb-6 overflow-hidden bg-[#f8f7f3] rounded-[2rem] flex items-center justify-center pointer-events-none">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    draggable={false}
                    className="w-full h-full object-contain p-6 md:p-8 mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out cursor-pointer pointer-events-auto"
                    onClick={() => {
                      if (isDragged.current) return;
                      navigate(`/product/${product.id}`);
                    }}
                  />
                  
                  {/* Quick Action Pill (Always visible on mobile, hover on desktop) */}
                  <div className="absolute left-3 top-3 md:left-4 md:top-4 flex flex-col items-center justify-center gap-3 md:gap-5 bg-gradient-to-br from-white/10 via-white/30 to-white/80 backdrop-blur-2xl rounded-full py-4 px-2.5 md:py-5 md:px-3.5 opacity-100 scale-100 md:opacity-0 md:scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400 ease-out pointer-events-auto z-10 shadow-sm border border-white/40">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openQuickView(product); }}
                      className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:scale-110 transition-all duration-300 flex items-center justify-center" aria-label="Quick view"
                    >
                      <Eye strokeWidth={1.5} className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      className="text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:scale-110 transition-all duration-300 flex items-center justify-center" aria-label="Add to cart"
                    >
                      <ShoppingCart strokeWidth={1.5} className="w-5 h-5 md:w-[22px] md:h-[22px]" />
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
                  className="text-sm md:text-base mb-1 text-white group-hover:text-white/60 transition-colors font-medium cursor-pointer text-center"
                  onClick={() => {
                    if (isDragged.current) return;
                    navigate(`/product/${product.id}`);
                  }}
                >
                  {product.name}
                </h3>
                <p className="text-white/60 text-xs md:text-sm tracking-wide text-center">
                  {product.price}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <CardinalArthurClubSection />

      {/* Find Your Perfume — same flow as home (pick → reveal, no auto-match) */}
      <section
        id="make-your-perfume"
        className="px-4 md:px-12 w-full max-w-[1400px] mx-auto scroll-mt-28 mt-20 md:mt-28 pb-16 md:pb-24"
      >
        <div
          className={`flex flex-col items-center text-center transition-[margin] duration-300 ${
            notesPhase === 'select' ? 'mb-10 md:mb-12' : 'mb-7 md:mb-8'
          }`}
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-semibold mb-4">
            Not sure where to start
          </p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl uppercase font-light tracking-tighter text-white leading-[0.9]">
            Find Your Perfume
          </h2>
          <AnimatePresence initial={false}>
            {notesPhase === 'select' && (
              <motion.p
                key="mkt-intro"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: NOTES_EASE }}
                className="overflow-hidden mt-4 text-sm md:text-base text-white/45 font-light max-w-lg"
              >
                Unsure which scent fits you? Pick a few notes you like — we’ll show the closest matches.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {notesPhase === 'select' && (
            <motion.div
              key="mkt-select"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: NOTES_EASE }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {draftNotes.length > 0 && (
                  <SpecularButton
                    type="button"
                    size="md"
                    radius={999}
                    tintOpacity={0}
                    blur={16}
                    baseColor="#52525b"
                    onClick={handleClearDraftNotes}
                    className={glassBtnClass}
                  >
                    <span className="text-white">Clear notes</span>
                  </SpecularButton>
                )}
                <SpecularButton
                  type="button"
                  size="md"
                  radius={999}
                  tintOpacity={0}
                  blur={16}
                  baseColor="#52525b"
                  onClick={() => setNotesPanelOpen((v) => !v)}
                  className={glassBtnClass}
                >
                  <span className="text-white">
                    {notesPanelOpen ? 'Hide notes' : 'Choose notes'}
                  </span>
                </SpecularButton>
              </div>

              <AnimatePresence initial={false}>
                {notesPanelOpen && (
                  <motion.div
                    key="mkt-notes-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: NOTES_EASE }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 md:pt-10">
                      <NotePicker
                        selected={draftNotes}
                        onChange={setDraftNotes}
                        max={MAX_USER_SELECTED_NOTES}
                      />
                      <AnimatePresence>
                        {draftNotes.length > 0 && (
                          <motion.p
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.3, ease: NOTES_EASE }}
                            className="mt-6 text-center text-xs md:text-sm text-white/40 font-light tracking-wide"
                          >
                            <span className="text-white/25">You’re drawn to · </span>
                            {draftNotes
                              .map((id) => resolveNoteLabel(id, noteLabelCatalog))
                              .join(' · ')}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {draftNotes.length > 0 && (
                  <motion.div
                    key="mkt-reveal"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: NOTES_EASE }}
                    className="overflow-hidden"
                  >
                    <div className="mt-8 md:mt-10 flex flex-col items-center gap-4">
                      <SpecularButton
                        type="button"
                        size="md"
                        radius={999}
                        tintOpacity={0}
                        blur={16}
                        baseColor="#52525b"
                        disabled={catalogLoading}
                        onClick={handleRevealMatches}
                        className={`${glassBtnClass} !px-8 !py-3.5 md:!px-10 md:!py-4 disabled:opacity-35 disabled:cursor-not-allowed`}
                      >
                        <span className="flex items-center justify-center gap-3 text-white">
                          Show my matches
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </SpecularButton>
                      {!notesPanelOpen && (
                        <p className="text-[11px] text-white/30 font-light tracking-wide text-center">
                          {draftNotes
                            .map((id) => resolveNoteLabel(id, noteLabelCatalog))
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {notesPhase === 'composing' && (
            <motion.div
              key="mkt-composing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="min-h-[220px] md:min-h-[260px] flex flex-col items-center justify-center gap-8 px-4"
            >
              <div className="text-center space-y-3">
                <p className="font-heading text-2xl md:text-4xl uppercase tracking-tighter font-light text-white">
                  Finding your perfume
                </p>
                <p className="text-sm text-white/40 font-light max-w-xs">
                  Comparing your notes with the Cardinal Arthur collection
                </p>
              </div>
              <div className="relative w-56 md:w-72 h-5 flex items-center" aria-hidden>
                <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
                <motion.div
                  className="relative h-[1.5px] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: NOTES_COMPOSE_MS / 1000,
                    ease: NOTES_EASE,
                  }}
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(178,133,88,0.45) 18%, #B28558 72%, #D4B08A 100%)',
                  }}
                >
                  <span
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 block rounded-full"
                    style={{
                      width: 5,
                      height: 5,
                      background:
                        'radial-gradient(circle at 35% 35%, #F4E4CC 0%, #B28558 55%, rgba(178,133,88,0.2) 100%)',
                      boxShadow:
                        '0 0 6px 1px rgba(178,133,88,0.45), 0 0 14px 2px rgba(178,133,88,0.2)',
                    }}
                  />
                </motion.div>
              </div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-light text-center">
                {committedNotes
                  .map((id) => resolveNoteLabel(id, noteLabelCatalog))
                  .join(' · ')}
              </p>
            </motion.div>
          )}

          {notesPhase === 'results' && (
            <motion.div
              key="mkt-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: NOTES_EASE }}
              className="space-y-8 md:space-y-10"
            >
              {noteMatches.length === 0 ? (
                <div className="max-w-sm mx-auto flex flex-col items-center text-center">
                  <h3 className="font-heading text-2xl md:text-3xl uppercase font-light tracking-tighter text-[#C97B7B]">
                    No match
                  </h3>
                  {committedNotes.length > 0 && (
                    <p className="mt-3 text-sm text-white/40 font-light tracking-wide">
                      {committedNotes
                        .map((id) => resolveNoteLabel(id, noteLabelCatalog))
                        .join(' · ')}
                    </p>
                  )}
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:gap-4">
                    <SpecularButton
                      type="button"
                      size="md"
                      radius={999}
                      tintOpacity={0}
                      blur={16}
                      baseColor="#52525b"
                      onClick={handleStartOverNotes}
                      className={glassBtnClass}
                    >
                      <span className="text-white">Try again</span>
                    </SpecularButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center text-center">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-primary font-semibold mb-3">
                      Your matches
                    </p>
                    <h3 className="text-xl md:text-2xl font-light tracking-wide text-white">
                      {noteMatches.length} perfume{noteMatches.length === 1 ? '' : 's'} for you
                    </h3>
                    {committedNotes.length > 0 && (
                      <p className="mt-3 text-sm text-white/40 font-light tracking-wide">
                        {committedNotes
                          .map((id) => resolveNoteLabel(id, noteLabelCatalog))
                          .join(' · ')}
                      </p>
                    )}
                    <div className="mt-6">
                      <SpecularButton
                        type="button"
                        size="md"
                        radius={999}
                        tintOpacity={0}
                        blur={16}
                        baseColor="#52525b"
                        onClick={handleStartOverNotes}
                        className={glassBtnClass}
                      >
                        <span className="text-white">Start over</span>
                      </SpecularButton>
                    </div>
                  </div>

                  {catalogLoading ? (
                    <p className="text-sm text-white/40 font-light py-10 text-center">
                      Loading matches…
                    </p>
                  ) : (
                    <PerfumeMatchResults
                      matches={noteMatches}
                      emptyMessage="No catalog scents match these notes in this category."
                    />
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0E1011]/60 backdrop-blur-md z-[100] overflow-y-auto [&::-webkit-scrollbar]:hidden"
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
                  className="bg-[#0E1011] w-full max-w-4xl rounded-[2.5rem] flex flex-col md:flex-row relative max-h-none md:max-h-[85vh] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-11 h-11 bg-[#0E1011]/10 md:bg-white/10 hover:bg-[#0E1011]/20 md:hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-black md:text-white transition-colors"
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

                    <div className="flex flex-col mt-auto pb-4 md:pb-0">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto self-start sm:self-auto">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 rounded-full border-[1.5px] border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                            aria-label="Decrease quantity"
                          >
                            <span className="text-xl font-light leading-none mb-1">-</span>
                          </button>
                          <span className="text-white text-xl font-medium w-4 text-center select-none">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              setQuantity((prev) =>
                                Math.min(
                                  prev + 1,
                                  selectedLimit.remainingQuantity || 1
                                )
                              )
                            }
                            disabled={
                              selectedLimit.isAtMax ||
                              quantity >= selectedLimit.remainingQuantity
                            }
                            className="w-12 h-12 rounded-full border-[1.5px] border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            aria-label="Increase quantity"
                          >
                            <span className="text-xl font-light leading-none mb-1">+</span>
                          </button>
                        </div>

                        <motion.button
                          onClick={() => handleAddToCart(selectedProduct, quantity)}
                          disabled={selectedLimit.isAtMax}
                          className="w-full sm:flex-1 bg-white text-black py-4 px-6 rounded-xl font-bold uppercase tracking-wider text-sm sm:text-base hover:bg-gray-200 transition-colors shrink-0 text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                          whileTap={{ scale: 0.98 }}
                        >
                          ADD TO CART
                        </motion.button>
                      </div>
                      {showLimitNote && (
                        <QuantityLimitNote
                          inCartQuantity={selectedLimit.inCartQuantity}
                          className="mt-3 self-start text-left"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FAQSection />

    </div>
    </>
  );
}
