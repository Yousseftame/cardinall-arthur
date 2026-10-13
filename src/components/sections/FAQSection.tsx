import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getFaqs, getSectionFaqs, type FaqRecord } from '../../services/faq.service';
import { FAQS as FALLBACK_FAQS } from '../../data/faq';
import { adminListQueryOptions } from '../../lib/adminQuery';

export default function FAQSection({
  hideTitle = false,
  columns = 1,
}: {
  hideTitle?: boolean;
  /** `1` = original full-width section layout; `2` = FAQ page grid */
  columns?: 1 | 2;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isTwoColumn = columns === 2;
  /** Section embeds only show starred FAQs; FAQ page shows all. */
  const sectionOnly = !isTwoColumn;

  const { data: faqs = [] } = useQuery({
    queryKey: sectionOnly ? ['faqs', 'section'] : ['faqs'],
    queryFn: sectionOnly ? getSectionFaqs : getFaqs,
    ...adminListQueryOptions,
  });

  const items: Array<Pick<FaqRecord, 'question' | 'answer'> | (typeof FALLBACK_FAQS)[number]> =
    faqs.length > 0
      ? faqs
      : FALLBACK_FAQS;

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (items.length === 0) return null;

  return (
    <section
      className={`w-full bg-transparent text-white px-4 md:px-12 flex justify-center ${
        hideTitle ? 'pt-8 md:pt-12 pb-24 md:pb-32' : 'py-24 md:py-32'
      }`}
    >
      <div className="max-w-[1200px] w-full">
        {!hideTitle && (
          <div className="flex flex-col md:flex-row mb-10 md:mb-14">
            <div className="hidden md:block md:w-[35%] lg:w-[40%] shrink-0" />
            <div className="flex-grow">
              <h2 className="text-4xl md:text-5xl lg:text-[56px] font-heading font-light tracking-tighter">
                Frequently Asked Questions
              </h2>
            </div>
          </div>
        )}

        {isTwoColumn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16">
            {items.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={'id' in faq ? (faq as FaqRecord).id : index}
                  className={`py-7 md:py-8 flex items-start gap-4 cursor-pointer group ${
                    index === 0
                      ? ''
                      : index === 1
                        ? 'border-t border-white/[0.15] md:border-t-0'
                        : 'border-t border-white/[0.15]'
                  }`}
                  onClick={() => toggleOpen(index)}
                >
                  <motion.div
                    layout
                    className={`w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-full flex items-center justify-center transition-colors duration-400 ease-[0.22,1,0.36,1] ${
                      isOpen
                        ? 'bg-white text-black'
                        : 'bg-white/[0.08] text-white group-hover:bg-white/[0.15]'
                    }`}
                  >
                    <div className="relative w-[16px] h-[16px] flex items-center justify-center">
                      <span className="absolute w-full h-[1.5px] bg-current rounded-full" />
                      <motion.span
                        className="absolute h-full w-[1.5px] bg-current rounded-full"
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </motion.div>

                  <div className="flex flex-col flex-grow min-w-0 pt-1">
                    <h3
                      className={`text-base md:text-lg font-medium tracking-wide transition-colors duration-500 leading-snug ${
                        isOpen ? 'text-white' : 'text-white/90 group-hover:text-white'
                      }`}
                    >
                      {faq.question}
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                          className="overflow-hidden"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                            className="pt-3 pb-1"
                          >
                            <p className="text-white/50 text-sm leading-relaxed font-light">
                              {faq.answer}
                            </p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col">
            {items.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={'id' in faq ? (faq as FaqRecord).id : index}
                  className={`${index !== 0 ? 'border-t border-white/[0.15]' : ''} py-8 md:py-10 flex flex-col md:flex-row cursor-pointer group`}
                  onClick={() => toggleOpen(index)}
                >
                  <div className="shrink-0 flex items-start md:w-[35%] lg:w-[40%] mb-4 md:mb-0">
                    <motion.div
                      layout
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-400 ease-[0.22,1,0.36,1] ${
                        isOpen
                          ? 'bg-white text-black'
                          : 'bg-white/[0.08] text-white group-hover:bg-white/[0.15]'
                      }`}
                    >
                      <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                        <span className="absolute w-full h-[1.5px] bg-current rounded-full" />
                        <motion.span
                          className="absolute h-full w-[1.5px] bg-current rounded-full"
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex flex-col flex-grow justify-center md:max-w-2xl">
                    <h3
                      className={`text-xl md:text-[22px] font-medium tracking-wide transition-colors duration-500 flex items-center min-h-[48px] ${
                        isOpen ? 'text-white' : 'text-white/90 group-hover:text-white'
                      }`}
                    >
                      {faq.question}
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                          className="overflow-hidden"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                            className="pt-4 pb-2"
                          >
                            <p className="text-white/50 text-sm md:text-base leading-relaxed font-light">
                              {faq.answer}
                            </p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
