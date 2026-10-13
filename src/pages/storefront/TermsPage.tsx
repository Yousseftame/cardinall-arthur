import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '../../components/layout/PageTransition';
import { Link } from 'react-router-dom';
import { TERMS_LAST_UPDATED, TERMS_SECTIONS } from '../../data/terms';
import {
  getTerms,
  splitTermParagraphs,
  type TermRecord,
} from '../../services/terms.service';
import { adminListQueryOptions } from '../../lib/adminQuery';

/** Strip leading "1. " / "2)" style numbers so titles don't double-number. */
function stripLeadingNumber(title: string): string {
  return title.replace(/^\s*\d+[\.\)]\s*/, '').trim();
}

export default function TermsPage() {
  const { data: terms = [] } = useQuery({
    queryKey: ['terms'],
    queryFn: getTerms,
    ...adminListQueryOptions,
  });

  const sections = useMemo(() => {
    if (terms.length > 0) {
      return terms.map((term: TermRecord) => ({
        id: term.id,
        title: stripLeadingNumber(term.title),
        paragraphs: splitTermParagraphs(term.description),
      }));
    }
    return TERMS_SECTIONS.map((section, index) => ({
      id: `fallback_${index}`,
      title: stripLeadingNumber(section.title),
      paragraphs: section.paragraphs,
    }));
  }, [terms]);

  const lastUpdated = useMemo(() => {
    if (terms.length === 0) return TERMS_LAST_UPDATED;
    const latest = terms.reduce((max, t) =>
      t.updatedAt > max ? t.updatedAt : max,
      terms[0].updatedAt
    );
    try {
      return new Date(latest).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return TERMS_LAST_UPDATED;
    }
  }, [terms]);

  return (
    <>
      <PageTransition />

      <div className="w-full pt-28 md:pt-36 pb-24 md:pb-32 px-4 md:px-12">
        <div className="max-w-[800px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold mb-4">
            Legal
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[56px] uppercase font-light tracking-tighter text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-white/45 text-sm mb-2">
            Last updated: {lastUpdated}
          </p>
          <p className="text-white/50 text-sm md:text-base font-light leading-relaxed mb-12 md:mb-16 max-w-xl">
            Please review these terms carefully. By using our website or placing an order,
            you agree to the following.
          </p>

          <div className="space-y-10 md:space-y-12">
            {sections.map((section, index) => (
              <section key={section.id} className="border-t border-white/[0.12] pt-8">
                <h2 className="text-lg md:text-xl font-medium text-white tracking-wide mb-4">
                  {index + 1}. {section.title}
                </h2>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph, i) => (
                    <p
                      key={`${section.id}-${i}`}
                      className="text-white/50 text-sm md:text-base leading-relaxed font-light"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-white/[0.12] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-white/40">
            <span>Need more help?</span>
            <Link to="/faq" className="text-primary hover:underline underline-offset-4 w-fit">
              Visit FAQ
            </Link>
            <Link to="/cant-find-it" className="text-primary hover:underline underline-offset-4 w-fit">
              Contact Community
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
