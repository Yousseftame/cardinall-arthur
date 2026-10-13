import PageTransition from '../../components/layout/PageTransition';
import FAQSection from '../../components/sections/FAQSection';
import { DiaTextReveal } from '../../components/ui/dia-text-reveal';

export default function FAQPage() {
  return (
    <>
      <PageTransition />

      <div className="w-full pt-28 md:pt-36 pb-4 md:pb-8 px-4 md:px-12">
        <div className="flex flex-col items-center justify-center text-center max-w-[900px] mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[56px] mb-6 uppercase font-light tracking-tighter text-white">
            <DiaTextReveal
              text="FREQUENTLY ASKED QUESTIONS"
              textColor="#ffffff"
              colors={['#ffffff', '#ffffff', 'transparent']}
              duration={1.5}
              delay={0.2}
              once={true}
            />
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-2xl font-light leading-relaxed tracking-wide">
            Answers to the questions we hear most often about Cardinal Arthur pieces,
            shipping, and custom work.
          </p>
        </div>
      </div>

      <FAQSection hideTitle columns={2} />
    </>
  );
}
