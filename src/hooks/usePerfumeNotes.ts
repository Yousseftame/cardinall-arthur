import { useQuery } from '@tanstack/react-query';
import { getNotes, notesToPickerOptions } from '../services/notes.service';
import { adminListQueryOptions } from '../lib/adminQuery';

export const NOTES_QUERY_KEY = ['perfume-notes'] as const;

export function usePerfumeNotes() {
  const query = useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: getNotes,
    ...adminListQueryOptions,
  });

  const notes = query.data ?? [];
  const activePickerNotes = notesToPickerOptions(notes);

  return {
    ...query,
    notes,
    activePickerNotes,
  };
}
