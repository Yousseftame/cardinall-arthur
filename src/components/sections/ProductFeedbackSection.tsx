import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { DiaTextReveal } from '../ui/dia-text-reveal';

const REVIEWS = [
  {
    id: 1,
    name: 'Layla Hassan',
    rating: 5,
    message:
      'The leather feels extraordinary — supple, structured, and already developing a beautiful patina. It arrived impeccably packed and looks even better in person.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Omar Khalil',
    rating: 5,
    message:
      'Craftsmanship is on another level. The stitching, hardware, and proportions are all considered. A piece I reach for every week without thinking twice.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Nour El-Sayed',
    rating: 4,
    message:
      'Quietly luxurious. It sits beautifully, holds more than expected, and the color is exactly as shown. Shipping was prompt and the unboxing felt special.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
  },
];

const GAP = 16;
const SLIDE_EASE = [0.22, 1, 0.36, 1] as const;
const LOOP_SLIDES = [
  { ...REVIEWS[REVIEWS.length - 1], key: 'clone-last' },
  ...REVIEWS.map((review) => ({ ...review, key: `real-${review.id}` })),
  { ...REVIEWS[0], key: 'clone-first' },
];
const FIRST_REAL = 1;
const LAST_REAL = REVIEWS.length;
const LAST_CLONE = LOOP_SLIDES.length - 1;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 md:w-[18px] md:h-[18px] ${
            i <= rating ? 'fill-[#B28558] text-[#B28558]' : 'fill-transparent text-white/20'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: (typeof REVIEWS)[number] }) {
  return (
    <article className="flex flex-col h-full rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-6 md:p-8 transition-colors duration-300 hover:border-white/[0.16] hover:bg-white/[0.06]">
      <div className="flex items-center gap-3.5 mb-5">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-11 h-11 rounded-full object-cover ring-1 ring-white/15"
        />
        <span className="text-white font-medium text-[15px] tracking-tight">{review.name}</span>
      </div>

      <StarRating rating={review.rating} />

      <p className="mt-4 md:mt-5 text-white/70 text-[15px] md:text-base leading-relaxed flex-1">
        “{review.message}”
      </p>
    </article>
  );
}

export default function ProductFeedbackSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [cardW, setCardW] = useState(0);
  const [activeIdx, setActiveIdx] = useState(FIRST_REAL);
  const [instant, setInstant] = useState(false);
  const [isSmall, setIsSmall] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => {
      setIsSmall(mq.matches);
      if (!mq.matches) {
        setInstant(true);
        setActiveIdx(FIRST_REAL);
      }
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.offsetWidth;
      if (width) setCardW(width);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!instant) return;
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, [instant]);

  useEffect(() => {
    if (!isSmall) return;
    const timer = setInterval(() => {
      if (!isDragging.current) {
        setActiveIdx((i) => (i >= LAST_CLONE ? i : i + 1));
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [isSmall]);

  const snapIfClone = (idx: number) => {
    if (idx === LAST_CLONE) {
      setInstant(true);
      setActiveIdx(FIRST_REAL);
    } else if (idx === 0) {
      setInstant(true);
      setActiveIdx(LAST_REAL);
    }
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    isDragging.current = false;
    const step = cardW + GAP;
    const swipeThreshold = step * 0.2;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -300) {
      setActiveIdx((i) => Math.min(LAST_CLONE, i + 1));
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 300) {
      setActiveIdx((i) => Math.max(0, i - 1));
    }
  };

  return (
    <section className="mt-32 md:mt-40 max-w-[1400px] mx-auto px-4 md:px-12">
      <h2 className="text-4xl md:text-5xl text-white font-medium mb-10 md:mb-12">
        <DiaTextReveal
          text="Client feedback"
          textColor="#ffffff"
          colors={['#ffffff', '#ffffff', 'transparent']}
          once={true}
        />
      </h2>

      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {REVIEWS.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <div className="lg:hidden overflow-hidden" ref={containerRef}>
        <motion.div
          className="grid w-full grid-flow-col auto-cols-[100%] cursor-grab active:cursor-grabbing select-none"
          style={{ gap: GAP, touchAction: 'pan-y' }}
          animate={{ x: cardW > 0 ? -(activeIdx * (cardW + GAP)) : 0 }}
          transition={instant ? { duration: 0 } : { duration: 0.65, ease: SLIDE_EASE }}
          drag={cardW > 0 ? 'x' : false}
          dragConstraints={{ left: -(LAST_CLONE * (cardW + GAP)), right: 0 }}
          dragElastic={0.08}
          onDragStart={() => {
            isDragging.current = true;
          }}
          onDragEnd={handleDragEnd}
          onAnimationComplete={() => snapIfClone(activeIdx)}
        >
          {LOOP_SLIDES.map((review) => (
            <div key={review.key} className="min-w-0 h-full">
              <ReviewCard review={review} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
