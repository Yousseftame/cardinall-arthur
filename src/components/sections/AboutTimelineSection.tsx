import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import {
  getTimeline,
  getTimelineAlign,
  type TimelineRecord,
} from '../../services/timeline.service';

function TimelineItem({
  item,
  align,
}: {
  item: TimelineRecord;
  align: 'left' | 'right';
}) {
  const isRight = align === 'right';

  return (
    <motion.div
      className={`relative flex w-full justify-between items-center ${isRight ? '' : 'flex-row-reverse'}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40% 0px -40% 0px' }}
    >
      <div className="hidden md:block w-1/2" />

      <motion.div
        className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full -translate-x-[7px] md:-translate-x-1/2 z-10"
        variants={{
          hidden: { backgroundColor: '#000', border: '2px solid rgba(255,255,255,0.2)' },
          visible: {
            backgroundColor: '#fff',
            border: '2px solid #fff',
            transition: { duration: 0.4 },
          },
        }}
      />

      <div
        className={`w-full md:w-1/2 flex flex-col pl-8 md:pl-0 ${isRight ? 'md:pl-20' : 'md:pr-20'}`}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
            },
          }}
        >
          <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-6">
            <h3 className="text-3xl md:text-4xl font-heading font-light tracking-tighter">
              {item.title}
            </h3>
            <span className="text-sm tracking-widest text-white/60 font-medium shrink-0 ml-4">
              {item.year}
            </span>
          </div>
          <p className="text-white/60 text-[17px] leading-relaxed max-w-md font-light tracking-tight">
            {item.description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function AboutTimelineSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Fetch only when this section mounts (About page)
  const { data: timeline = [] } = useQuery({
    queryKey: ['timeline'],
    queryFn: getTimeline,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-transparent text-white py-40 px-4 md:px-12 overflow-hidden"
    >
      <motion.div
        className="text-center mb-40"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-4xl md:text-7xl font-heading uppercase font-light tracking-tighter">
          <DiaTextReveal
            text="OUR JOURNEY IN CRAFT."
            textColor="#ffffff"
            colors={['#ffffff']}
          />
        </h2>
      </motion.div>

      <div className="relative max-w-5xl mx-auto py-10">
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/15 -translate-x-1/2" />

        <motion.div
          className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-white -translate-x-1/2 origin-top"
          style={{ scaleY: smoothProgress }}
        />

        <div className="flex flex-col space-y-32 md:space-y-48">
          {timeline.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              align={getTimelineAlign(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
