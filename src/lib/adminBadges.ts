/** Instant local hint before the Firestore badge listener connects. */
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
  clubAdvance: 'cardinall_club_advance_store',
} as const;

export const ADMIN_BADGE_COLLECTIONS = {
  feedbacks: 'feedbacks',
  contact: 'contact_messages',
  cantFind: 'cant_find_requests',
  clubAdvance: 'club_advance_requests',
} as const;

/** Same-tab instant badge bumps when a guest form writes localStorage. */
export const ADMIN_BADGE_EVENTS = {
  feedbacks: 'cardinall_feedbacks_updated',
  contact: 'cardinall_contact_updated',
  cantFind: 'cardinall_cant_find_updated',
  clubAdvance: 'cardinall_club_advance_updated',
} as const;

export const ADMIN_BADGE_EVENT_BY_STORE: Record<string, string> = {
  [ADMIN_BADGE_STORES.feedbacks]: ADMIN_BADGE_EVENTS.feedbacks,
  [ADMIN_BADGE_STORES.contact]: ADMIN_BADGE_EVENTS.contact,
  [ADMIN_BADGE_STORES.cantFind]: ADMIN_BADGE_EVENTS.cantFind,
  [ADMIN_BADGE_STORES.clubAdvance]: ADMIN_BADGE_EVENTS.clubAdvance,
};
