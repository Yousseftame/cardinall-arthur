import { useQuery } from '@tanstack/react-query';
import { getNotes, notesToPickerOptions } from '../services/notes.service';
import { adminListQueryOptions } from '../lib/adminQuery';

/** Storefront / product forms — fetched only where notes are needed */
export const NOTES_QUERY_KEY = ['perfume-notes'] as const;

/** Admin Scent Notes page — separate key, fetched only on /admin/notes */
export const ADMIN_NOTES_QUERY_KEY = ['admin-notes'] as const;

export function usePerfumeNotes() {
  const query = useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: getNotes,
    ...adminListQueryOptions,
    staleTime: 1000 * 60 * 5,
  });

  const notes = query.data ?? [];
  const activePickerNotes = notesToPickerOptions(notes);

  return {
    ...query,
    notes,
    activePickerNotes,
  };
}
