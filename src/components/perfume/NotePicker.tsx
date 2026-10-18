import { MAX_USER_SELECTED_NOTES } from '../../data/perfumeNotes';
import { usePerfumeNotes } from '../../hooks/usePerfumeNotes';
import { cn } from '../../lib/utils';

interface NotePickerProps {
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
  className?: string;
  /** Override notes list (defaults to active admin-managed notes) */
  notes?: Array<{ id: string; label: string }>;
}

export default function NotePicker({
  selected,
  onChange,
  max = MAX_USER_SELECTED_NOTES,
  className,
  notes: notesProp,
}: NotePickerProps) {
  const { activePickerNotes, isLoading } = usePerfumeNotes();
  const notes = notesProp ?? activePickerNotes;

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((n) => n !== id));
      return;
    }
    if (selected.length >= max) return;
    onChange([...selected, id]);
  };

  return (
    <div className={cn('space-y-6 md:space-y-8', className)}>
      <div className="flex items-baseline justify-center gap-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/40 font-medium">
          Select notes
        </p>
        <p
          className={cn(
            'text-[11px] font-medium tabular-nums tracking-[0.12em] transition-colors duration-300',
            selected.length > 0 ? 'text-primary' : 'text-white/35'
          )}
        >
          {selected.length}/{max}
        </p>
      </div>

      {isLoading && !notesProp ? (
        <p className="text-sm text-white/40 font-light py-6 text-center">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-white/40 font-light py-6 text-center">
          No scent notes are available yet. Check back soon.
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-1 gap-y-2 md:gap-x-2 md:gap-y-3">
          {notes.map((note) => {
            const isOn = selected.includes(note.id);
            const atMax = !isOn && selected.length >= max;
            return (
              <button
                key={note.id}
                type="button"
                disabled={atMax}
                aria-pressed={isOn}
                onClick={() => toggle(note.id)}
                className={cn(
                  'relative px-2.5 py-2 md:px-3 md:py-2.5 text-[13px] md:text-sm tracking-[0.04em] transition-colors duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
                  isOn
                    ? 'text-primary font-medium'
                    : 'text-white/55 font-light hover:text-white'
                )}
              >
                {note.label}
                <span
                  className={cn(
                    'absolute left-2.5 right-2.5 md:left-3 md:right-3 bottom-1 h-px origin-left transition-all duration-300 ease-out',
                    isOn ? 'bg-primary scale-x-100 opacity-100' : 'bg-white/0 scale-x-0 opacity-0'
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
