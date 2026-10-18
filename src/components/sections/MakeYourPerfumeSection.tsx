import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { DiaTextReveal } from '../ui/dia-text-reveal';
import SpecularButton from '../SpecularButton';
import NotePicker from '../perfume/NotePicker';
import PerfumeMatchResults from '../perfume/PerfumeMatchResults';
import { useProducts } from '../../hooks/useProducts';
import { matchProductsByNotes } from '../../lib/matchProductsByNotes';
import { MAX_USER_SELECTED_NOTES, resolveNoteLabel } from '../../data/perfumeNotes';
import { usePerfumeNotes } from '../../hooks/usePerfumeNotes';

type Phase = 'select' | 'composing' | 'results';

const COMPOSE_MS = 1400;
const EASE = [0.22, 1, 0.36, 1] as const;

const glassBtnClass =
  '!px-7 !py-3 md:!px-8 md:!py-3.5 text-xs tracking-[0.18em] font-bold uppercase !rounded-full !bg-gradient-to-br !from-white/15 !via-white/5 !to-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(255,255,255,0.08),0_8px_28px_-10px_rgba(0,0,0,0.55)] hover:!from-white/22 hover:!via-white/8 hover:!to-white/12 transition-all duration-300 cursor-pointer';

export default function MakeYourPerfumeSection() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const { notes: noteCatalog } = usePerfumeNotes();
  const catalog = noteCatalog.map((n) => ({ id: n.slug, label: n.label }));
  const [selected, setSelected] = useState<string[]>([]);
  const [notesOpen, setNotesOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('select');
  const [committedSelection, setCommittedSelection] = useState<string[]>([]);

  const matches = useMemo(
    () => matchProductsByNotes(products, committedSelection),
    [products, committedSelection]
  );

  useEffect(() => {
    if (phase !== 'composing') return;
    const t = setTimeout(() => setPhase('results'), COMPOSE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const handleReveal = () => {
    if (selected.length < 1 || phase === 'composing') return;
    setNotesOpen(false);
    setCommittedSelection(selected);
    setPhase('composing');
  };

  const handleReset = () => {
    setPhase('select');
    setCommittedSelection([]);
    setNotesOpen(true);
  };

  const handleClearNotes = () => {
    setSelected([]);
  };

  const marketplaceHref =
    committedSelection.length > 0
      ? `/marketplace?notes=${committedSelection.join(',')}`
      : '/marketplace';

  return (
    <section className="w-full pt-20 md:pt-28 pb-24 md:pb-32 px-4 md:px-12">
      <div className="w-full max-w-[1400px] mx-auto">
        <div
          className={`flex flex-col items-center text-center transition-[margin] duration-300 ${
            phase === 'select' ? 'mb-10 md:mb-14' : 'mb-7 md:mb-8'
          }`}
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-[11px] uppercase tracking-[0.32em] text-primary font-semibold mb-5"
          >
            Not sure where to start
          </motion.p>

          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase font-light tracking-tighter text-white leading-[0.9]">
            <DiaTextReveal
              text="Find Your Perfume"
              textColor="#ffffff"
              colors={['#ffffff', '#ffffff', 'transparent']}
              duration={1.5}
              delay={0.1}
              once={true}
            />
          </h2>

          <AnimatePresence initial={false}>
            {phase === 'select' && (
              <motion.p
                key="intro-desc"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden mt-5 md:mt-6 text-white/50 text-sm md:text-base font-light leading-relaxed max-w-lg"
              >
                Unsure which scent fits you? Pick a few notes you like — we’ll show the closest matches from the collection.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {selected.length > 0 && (
                  <SpecularButton
                    type="button"
                    size="md"
                    radius={999}
                    tintOpacity={0}
                    blur={16}
                    baseColor="#52525b"
                    onClick={handleClearNotes}
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
                  onClick={() => setNotesOpen((v) => !v)}
                  className={glassBtnClass}
                >
                  <span className="text-white">
                    {notesOpen ? 'Hide notes' : 'Choose notes'}
                  </span>
                </SpecularButton>
              </div>

              <AnimatePresence initial={false}>
                {notesOpen && (
                  <motion.div
                    key="notes-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 md:pt-10">
                      <NotePicker
                        selected={selected}
                        onChange={setSelected}
                        max={MAX_USER_SELECTED_NOTES}
                      />

                      <AnimatePresence>
                        {selected.length > 0 && (
                          <motion.p
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="mt-6 text-center text-xs md:text-sm text-white/40 font-light tracking-wide"
                          >
                            <span className="text-white/25">You’re drawn to · </span>
                            {selected
                              .map((id) => resolveNoteLabel(id, catalog))
                              .join(' · ')}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {selected.length > 0 && (
                  <motion.div
                    key="reveal-cta"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
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
                        disabled={isLoading}
                        onClick={handleReveal}
                        className={`${glassBtnClass} !px-8 !py-3.5 md:!px-10 md:!py-4 disabled:opacity-35 disabled:cursor-not-allowed`}
                      >
                        <span className="flex items-center justify-center gap-3 text-white">
                          Show my matches
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </SpecularButton>
                      {!notesOpen && (
                        <p className="text-[11px] text-white/30 font-light tracking-wide text-center">
                          {selected
                            .map((id) => resolveNoteLabel(id, catalog))
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {phase === 'composing' && (
            <motion.div
              key="composing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="min-h-[260px] md:min-h-[300px] flex flex-col items-center justify-center gap-8 px-4"
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
                {/* Track */}
                <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />

                {/* Progress fill — clean taper into the tip */}
                <motion.div
                  className="relative h-[1.5px] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: COMPOSE_MS / 1000,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(178,133,88,0.45) 18%, #B28558 72%, #D4B08A 100%)',
                  }}
                >
                  {/* Precise tip — soft bloom, no glass slab */}
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
                {committedSelection
                  .map((id) => resolveNoteLabel(id, catalog))
                  .join(' · ')}
              </p>
            </motion.div>
          )}

          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {matches.length === 0 ? (
                <div className="max-w-sm mx-auto flex flex-col items-center text-center">
                  <h3 className="font-heading text-2xl md:text-3xl uppercase font-light tracking-tighter text-[#C97B7B]">
                    No match
                  </h3>

                  {committedSelection.length > 0 && (
                    <p className="mt-3 text-sm text-white/40 font-light tracking-wide">
                      {committedSelection
                        .map((id) => resolveNoteLabel(id, catalog))
                        .join(' · ')}
                    </p>
                  )}

                  <div className="mt-7 flex items-center gap-5">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs uppercase tracking-[0.2em] text-[#C97B7B] hover:text-[#E0A0A0] transition-colors cursor-pointer"
                    >
                      Try again
                    </button>
                    <span className="text-white/20">/</span>
                    <Link
                      to="/cant-find-it"
                      className="text-xs uppercase tracking-[0.2em] text-white/45 hover:text-white transition-colors"
                    >
                      Custom blend
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 md:space-y-10">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-primary font-semibold mb-3">
                      Your matches
                    </p>
                    <h3 className="text-xl md:text-2xl font-light tracking-wide text-white">
                      {matches.length} perfume{matches.length === 1 ? '' : 's'} for you
                    </h3>
                    {committedSelection.length > 0 && (
                      <p className="mt-3 text-sm text-white/40 font-light tracking-wide">
                        {committedSelection
                          .map((id) => resolveNoteLabel(id, catalog))
                          .join(' · ')}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:gap-4">
                      <SpecularButton
                        type="button"
                        size="md"
                        radius={999}
                        tintOpacity={0}
                        blur={16}
                        baseColor="#52525b"
                        onClick={handleReset}
                        className={glassBtnClass}
                      >
                        <span className="text-white">Start over</span>
                      </SpecularButton>
                      <SpecularButton
                        type="button"
                        size="md"
                        radius={999}
                        tintOpacity={0}
                        blur={16}
                        baseColor="#52525b"
                        onClick={() => navigate(marketplaceHref)}
                        className={glassBtnClass}
                      >
                        <span className="text-white">Marketplace</span>
                      </SpecularButton>
                    </div>
                  </div>

                  <PerfumeMatchResults matches={matches} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
