import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import ClubCard3D from '../club/ClubCard3D';
import { CLUB_COPY, CLUB_TOTAL_CARDS } from '../../data/club';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CardinalArthurClubSection() {
  return (
    <section className="relative w-full py-16 sm:py-24 md:py-36 px-4 sm:px-6 md:px-12 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle 600px at 50% 45%, rgba(44, 14, 17, 0.45) 0%, rgba(178, 133, 88, 0.08) 45%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-24px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-4 sm:mb-6 text-[10px] sm:text-[11px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-[#C9A86A]/80 font-light px-2"
        >
          Limited to {CLUB_TOTAL_CARDS} membership cards
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-24px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="font-heading text-[1.85rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl uppercase font-light tracking-tighter text-white sm:leading-[0.95] max-w-4xl px-1"
        >
          <DiaTextReveal
            text={CLUB_COPY.name}
            textColor="#ffffff"
            colors={['#ffffff', '#ffffff', '#ffffff']}
            duration={1.6}
            delay={0.15}
            once={true}
          />
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-24px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="font-serif italic text-[15px] sm:text-lg md:text-xl text-white/70 tracking-wide mt-3 sm:mt-5 max-w-xl px-2"
        >
          {CLUB_COPY.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-24px' }}
          transition={{ duration: 0.55, delay: 0.25, ease: EASE }}
          className="text-white/45 text-[13px] sm:text-base font-light leading-relaxed mt-3 sm:mt-4 max-w-xl px-3"
        >
          {CLUB_COPY.intro}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.55, ease: EASE }}
          className="w-full max-w-[min(100%,420px)] sm:max-w-[520px] md:max-w-[560px] mt-10 sm:mt-14 md:mt-16 px-1"
        >
          <ClubCard3D interactive={true} allowFlipOnClick={true} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-16px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-4 sm:mt-6 flex flex-col items-center w-full px-2"
        >
          <Link
            to="/club"
            className="group inline-flex w-full max-w-[320px] sm:w-auto sm:max-w-none items-center justify-center px-8 py-4 md:px-10 text-xs sm:text-[13px] tracking-[0.16em] sm:tracking-[0.2em] font-semibold uppercase rounded-full bg-gradient-to-br from-white/18 via-white/8 to-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_12px_36px_-10px_rgba(0,0,0,0.7)] hover:from-white/26 hover:via-white/12 hover:to-white/16 transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <span className="flex items-center justify-center gap-3 text-white">
              <span>Explore The Club</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
            </span>
          </Link>

          <p className="mt-6 sm:mt-7 text-[10px] sm:text-xs text-white/40 tracking-[0.12em] sm:tracking-[0.16em] uppercase font-light leading-relaxed max-w-[280px] sm:max-w-md px-2">
            {CLUB_COPY.scarcity}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
