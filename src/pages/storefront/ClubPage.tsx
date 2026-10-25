import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import PageTransition from '../../components/layout/PageTransition';
import ClubCard3D from '../../components/club/ClubCard3D';
import ClubAdvanceRequestModal from '../../components/modals/ClubAdvanceRequestModal';
import { DiaTextReveal } from '../../components/ui/dia-text-reveal';
import {
  CLUB_COPY,
  CLUB_PRIVILEGES,
  CLUB_JOIN_PATHS,
  CLUB_TOTAL_CARDS,
} from '../../data/club';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ClubPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <PageTransition />

      <div className="relative w-full pt-28 md:pt-36 pb-28 md:pb-40 px-4 sm:px-6 md:px-12 overflow-hidden">
        {/* Ambient Top Spotlight */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none rounded-full blur-[140px] opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(178,133,88,0.4) 0%, rgba(44,14,17,0.5) 50%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-[1300px] mx-auto">
          {/* ===================== HERO HEADER ===================== */}
          <div className="flex flex-col items-center text-center w-full max-w-5xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mb-6 text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#C9A86A]/80 font-light"
            >
              Limited to {CLUB_TOTAL_CARDS} membership cards
            </motion.p>

            <h1 className="font-heading w-full whitespace-nowrap uppercase font-light tracking-tighter text-white leading-none text-[clamp(1.35rem,6.2vw,5.25rem)]">
              <DiaTextReveal
                text={CLUB_COPY.name}
                textColor="#ffffff"
                colors={['#ffffff', '#ffffff', '#ffffff']}
                duration={1.8}
                delay={0.1}
                once={true}
              />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="font-serif italic text-lg sm:text-xl md:text-2xl text-[#E5C9A4] tracking-wide mt-5 md:mt-6"
            >
              {CLUB_COPY.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
              className="text-white/60 text-sm sm:text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl"
            >
              {CLUB_COPY.intro}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 text-white/40 text-xs sm:text-sm font-light tracking-wide max-w-xl"
            >
              {CLUB_COPY.scarcity}
            </motion.p>
          </div>

          {/* ===================== THE 3D CARD SHOWCASE ===================== */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
            className="mt-14 md:mt-20 flex flex-col items-center"
          >
            <div className="w-full max-w-[560px]">
              <ClubCard3D interactive={true} allowFlipOnClick={true} />
            </div>
          </motion.div>

          {/* ===================== CARD SPECS BAR ===================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-16 md:mt-24 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 border-y border-white/[0.08] py-8"
          >
            {[
              { label: 'Total Allocation', value: `${CLUB_TOTAL_CARDS} Cards Only` },
              { label: 'Availability', value: 'Once Issued, Closed' },
              { label: 'Privileges', value: 'Six Exclusive Benefits' },
              { label: 'Access', value: 'Members Only' },
            ].map((spec) => (
              <div key={spec.label} className="flex flex-col items-center text-center px-2">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white/40 mb-1 font-mono">
                  {spec.label}
                </span>
                <span className="text-sm sm:text-base font-light text-white tracking-wide">
                  {spec.value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* ===================== MEMBERSHIP PRIVILEGES ===================== */}
          <div className="mt-24 md:mt-36">
            <div className="text-center mb-12 md:mb-14">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary font-medium mb-3">
                Membership Privileges
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase font-light tracking-tighter text-white">
                What Membership Unlocks
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {CLUB_PRIVILEGES.map((privilege, index) => (
                <motion.article
                  key={privilege.number}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-24px' }}
                  transition={{ duration: 0.4, delay: index * 0.04, ease: EASE }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#B28558]/25 bg-gradient-to-br from-[#3a1a1e]/70 via-[#1c1614]/80 to-[#12100e]/90 backdrop-blur-md p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,235,200,0.14),0_12px_40px_-20px_rgba(0,0,0,0.65)] transition-all duration-300 hover:border-[#C9A86A]/45 hover:shadow-[inset_0_1px_0_rgba(255,235,200,0.22),0_16px_48px_-18px_rgba(44,14,17,0.7)]"
                >
                  <div
                    className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-[#B28558]/15 blur-2xl transition-opacity duration-300 group-hover:bg-[#C9A86A]/25"
                    aria-hidden="true"
                  />

                  <span className="relative text-xs tracking-[0.18em] text-[#E5C9A4] mb-4 font-medium">
                    {privilege.number}
                  </span>

                  <h3 className="relative font-heading text-xl uppercase font-light tracking-tight text-white mb-3 leading-snug group-hover:text-[#F4E4CC] transition-colors duration-300">
                    {privilege.title}
                  </h3>

                  {privilege.description && (
                    <p className="relative text-white/75 text-sm font-light leading-relaxed">
                      {privilege.description}
                    </p>
                  )}

                  {privilege.details && (
                    <ul className="relative space-y-3.5 mt-1">
                      {privilege.details.map((detail) => (
                        <li key={detail.label} className="text-sm font-light leading-relaxed pl-3 border-l border-[#B28558]/45">
                          <span className="text-[#E5C9A4] block mb-0.5">{detail.label}</span>
                          <span className="text-white/70">{detail.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.article>
              ))}
            </div>
          </div>

          {/* ===================== HOW TO JOIN (2 PATHS) ===================== */}
          <div className="mt-28 md:mt-40">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-semibold mb-3">
                Acquisition
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase font-light tracking-tight text-white">
                How To Secure Your Card
              </h2>
              <p className="text-white/50 text-sm sm:text-base font-light mt-3 max-w-md mx-auto">
                Receive your card free with your third order, or request it in advance for 1,000 EGP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {CLUB_JOIN_PATHS.map((path) => {
                const isAdvance = path.id === 'advance';

                return (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className={`group relative overflow-hidden rounded-3xl p-8 md:p-10 flex flex-col justify-between backdrop-blur-md ${
                      isAdvance
                        ? 'border border-[#B28558]/45 bg-gradient-to-br from-[#3a1a1e]/75 via-[#1c1614]/85 to-[#12100e]/95 shadow-[inset_0_1px_0_rgba(255,235,200,0.16),0_18px_50px_-20px_rgba(44,14,17,0.85)] hover:border-[#C9A86A]/65'
                        : 'border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_40px_-20px_rgba(0,0,0,0.55)] hover:border-white/30 hover:bg-white/[0.07]'
                    } transition-[border-color,background-color] duration-300`}
                  >
                    <div
                      className={`pointer-events-none absolute -right-12 -top-10 h-36 w-36 rounded-full blur-2xl transition-opacity duration-300 ${
                        isAdvance
                          ? 'bg-[#B28558]/25 group-hover:bg-[#C9A86A]/35'
                          : 'bg-white/10 group-hover:bg-white/16'
                      }`}
                      aria-hidden="true"
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`text-[10px] uppercase tracking-[0.24em] font-semibold px-3 py-1 rounded-full ${
                            isAdvance
                              ? 'bg-[#B28558] text-[#1A1612]'
                              : 'bg-white/12 text-white/75'
                          }`}
                        >
                          {path.badge}
                        </span>
                        <span className="text-xs text-white/40 font-mono">
                          Tier {isAdvance ? '01-A' : '01-B'}
                        </span>
                      </div>

                      <h3 className="font-heading text-2xl sm:text-3xl uppercase font-light text-white tracking-tight mb-2 transition-colors duration-300 group-hover:text-[#F4E4CC]">
                        {path.title}
                      </h3>

                      <div className="my-6">
                        <span className="font-heading text-3xl sm:text-4xl font-normal text-white">
                          {path.price}
                        </span>
                        <p className="text-xs text-white/55 tracking-wide mt-1">
                          {path.priceNote}
                        </p>
                      </div>

                      <ul className="space-y-3.5 mb-8">
                        {path.perks.map((perk) => (
                          <li
                            key={perk}
                            className="flex items-start gap-3 text-sm text-white/75 font-light"
                          >
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isAdvance ? (
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="relative w-full py-4 rounded-full font-medium text-xs uppercase tracking-[0.2em] bg-gradient-to-r from-[#D4AF6A] to-[#B28558] text-[#1A1612] shadow-[0_8px_24px_-8px_rgba(178,133,88,0.65)] hover:brightness-110 hover:shadow-[0_12px_28px_-8px_rgba(201,168,106,0.75)] active:scale-[0.97] active:brightness-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group/btn"
                      >
                        <span>Request Advance Card</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                      </button>
                    ) : (
                      <Link
                        to="/marketplace"
                        className="relative w-full py-4 rounded-full font-medium text-xs uppercase tracking-[0.2em] bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/20 hover:border-white/35 active:scale-[0.97] active:bg-white/[0.12] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group/btn"
                      >
                        <span>Explore Fragrances</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ClubAdvanceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
