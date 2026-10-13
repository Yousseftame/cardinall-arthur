/**
 * Zero-Firebase badge helpers.
 * Counts come from React Query cache (after a page visit) or localStorage peek only.
 * Never triggers Firestore reads from the sidebar/layout.
 */

export function countNewFromLocalStore(storageKey: string): number {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter((item: { status?: string }) => item?.status === 'new').length;
  } catch {
    return 0;
  }
}

export const ADMIN_BADGE_STORES = {
  feedbacks: 'cardinall_feedbacks_store',
  contact: 'cardinall_contact_store',
  cantFind: 'cardinall_cant_find_store',
} as const;
