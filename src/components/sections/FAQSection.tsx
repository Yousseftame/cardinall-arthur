import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const faqs = [
  {
    question: "What materials are used in Cardinal Arthur pieces?",
    answer: "We source only the finest full-grain leathers and premium hardware. Every piece is meticulously crafted to ensure longevity and an exquisite patina over time."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship globally. International orders are handled via premium courier services to ensure your pieces arrive safely and promptly, no matter where you are."
  },
  {
    question: "What is your design process?",
    answer: "Our design process marries heritage craftsmanship with avant-garde aesthetics. Every concept begins with meticulous sketching and prototyping, ensuring perfect proportions before moving into limited-run production."
  },
  {
    question: "How long does a custom project usually take?",
    answer: "Custom bespoke projects typically require 6 to 8 weeks from initial consultation to final delivery, as every detail is meticulously handcrafted to your exact specifications."
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We accept returns and exchanges within 14 days of delivery. Items must be in their original, unused condition with all tags and packaging intact. Custom or personalized items are final sale."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#0a0a0a] text-white py-24 md:py-32 px-4 md:px-12 flex justify-center">
      <div className="max-w-[1200px] w-full">
        
        {/* Title Row */}
        <div className="flex flex-col md:flex-row mb-10 md:mb-14">
          {/* Left spacer for desktop to align title with questions */}
          <div className="hidden md:block md:w-[35%] lg:w-[40%] shrink-0"></div>
          <div className="flex-grow">
            <h2 
              className="text-4xl md:text-5xl lg:text-[56px] font-medium tracking-tight"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index} 
                className={`${index !== 0 ? 'border-t border-white/[0.15]' : ''} py-8 md:py-10 flex flex-col md:flex-row cursor-pointer group`}
                onClick={() => toggleOpen(index)}
              >
                {/* Icon Column */}
                <div className="shrink-0 flex items-start md:w-[35%] lg:w-[40%] mb-4 md:mb-0">
                  <motion.div 
                    layout
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-400 ease-[0.22,1,0.36,1] ${isOpen ? 'bg-white text-black' : 'bg-white/[0.08] text-white group-hover:bg-white/[0.15]'}`}
                  >
                    <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                      {/* Horizontal Line - Stays static */}
                      <span className="absolute w-full h-[1.5px] bg-current rounded-full" />
                      
                      {/* Vertical Line - Rotates to overlap horizontal */}
                      <motion.span 
                        className="absolute h-full w-[1.5px] bg-current rounded-full"
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Content Column */}
                <div className="flex flex-col flex-grow justify-center md:max-w-2xl">
                  <h3 
                    className={`text-xl md:text-[22px] font-medium tracking-wide transition-colors duration-500 flex items-center min-h-[48px] ${isOpen ? 'text-white' : 'text-white/90 group-hover:text-white'}`}
                    style={{ fontFamily: '"Outfit", sans-serif' }}
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
                          <p 
                            className="text-white/50 text-sm md:text-base leading-relaxed font-light"
                            style={{ fontFamily: '"Outfit", sans-serif' }}
                          >
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
      </div>
    </section>
  );
}
