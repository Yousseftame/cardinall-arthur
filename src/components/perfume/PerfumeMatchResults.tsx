import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import {
  formatProductPrice,
  getProductImageSrc,
  getProductSharePath,
} from '../../services/products.service';
import type { ProductNoteMatch } from '../../lib/matchProductsByNotes';
import { resolveNoteLabel } from '../../data/perfumeNotes';
import { usePerfumeNotes } from '../../hooks/usePerfumeNotes';
import { cn } from '../../lib/utils';

interface PerfumeMatchResultsProps {
  matches: ProductNoteMatch[];
  className?: string;
  emptyMessage?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
}

export default function PerfumeMatchResults({
  matches,
  className,
  emptyMessage = 'No perfumes in the collection match these notes yet.',
  emptyActionHref = '/cant-find-it',
  emptyActionLabel = 'Request a custom blend',
}: PerfumeMatchResultsProps) {
  const { notes } = usePerfumeNotes();
  const catalog = notes.map((n) => ({ id: n.slug, label: n.label }));

  if (matches.length === 0) {
    return (
      <div className={cn('max-w-sm mx-auto text-center py-10 md:py-12', className)}>
        <h3 className="font-heading text-2xl md:text-3xl uppercase font-light tracking-tighter text-[#C97B7B]">
          No match
        </h3>
        <p className="mt-4 text-sm text-white/40 font-light leading-relaxed">{emptyMessage}</p>
        <Link
          to={emptyActionHref}
          className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
        >
          {emptyActionLabel}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-wrap justify-center gap-8 md:gap-12',
        className
      )}
    >
      {matches.map(({ product, matchedNoteIds, perfectMatch }) => {
        const matchedLabels = matchedNoteIds.map((id) =>
          resolveNoteLabel(id, catalog)
        );

        return (
          <Link
            key={product.id}
            to={getProductSharePath(product)}
            className="group flex flex-col items-center w-[240px] md:w-[280px] lg:w-[18vw] max-w-[300px]"
          >
            <div className="relative w-full aspect-[4/5] md:aspect-square mb-6 overflow-hidden bg-[#f8f7f3] rounded-[2rem] flex items-center justify-center">
              <img
                src={getProductImageSrc(product)}
                alt={product.name}
                className="w-full h-full object-contain p-6 md:p-8 mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {perfectMatch && (
                <span className="absolute top-3 left-3 md:top-4 md:left-4 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.16em] font-semibold text-[#0E1011] bg-gradient-to-br from-white/70 via-white/45 to-white/25 backdrop-blur-xl border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_4px_14px_-4px_rgba(0,0,0,0.2)]">
                  Full match
                </span>
              )}
            </div>

            <h3 className="text-sm md:text-base mb-1 text-white group-hover:text-white/60 transition-colors font-medium text-center">
              {product.name}
            </h3>
            <p className="text-white/60 text-xs md:text-sm tracking-wide text-center">
              {formatProductPrice(product.price)}
            </p>
            {matchedLabels.length > 0 && (
              <p className="mt-1.5 text-[11px] text-primary/80 font-light tracking-wide text-center">
                {matchedLabels.join(' · ')}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
