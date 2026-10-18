import { resolveNoteLabel } from '../../data/perfumeNotes';
import { usePerfumeNotes } from '../../hooks/usePerfumeNotes';
import { cn } from '../../lib/utils';

interface NoteChipsProps {
  noteIds: string[];
  /** Highlight these as matched */
  highlightIds?: string[];
  className?: string;
  size?: 'sm' | 'md';
}

export default function NoteChips({
  noteIds,
  highlightIds,
  className,
  size = 'sm',
}: NoteChipsProps) {
  const { notes } = usePerfumeNotes();
  const catalog = notes.map((n) => ({ id: n.slug, label: n.label }));

  if (!noteIds?.length) return null;
  const highlight = new Set(highlightIds || []);

  return (
    <p
      className={cn(
        'font-medium tracking-wide leading-relaxed',
        size === 'sm' ? 'text-[11px]' : 'text-xs',
        className
      )}
    >
      {noteIds.map((id, i) => {
        const on = highlight.has(id);
        return (
          <span key={id}>
            {i > 0 && <span className="text-white/20"> · </span>}
            <span className={on ? 'text-primary' : 'text-white/45'}>
              {resolveNoteLabel(id, catalog)}
            </span>
          </span>
        );
      })}
    </p>
  );
}
