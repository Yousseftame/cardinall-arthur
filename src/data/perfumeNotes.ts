/** Suggested scent notes (seeded into admin notes store) + shared helpers. */

export interface PerfumeNote {
  id: string;
  label: string;
  family?: string;
}

export const MAX_PRODUCT_NOTES = 8;
export const MAX_USER_SELECTED_NOTES = 5;

/** Recommended starter notes — admin can add/remove freely beyond these. */
export const SUGGESTED_PERFUME_NOTES: PerfumeNote[] = [
  { id: 'bergamot', label: 'Bergamot', family: 'citrus' },
  { id: 'lemon', label: 'Lemon', family: 'citrus' },
  { id: 'orange-blossom', label: 'Orange Blossom', family: 'citrus' },
  { id: 'grapefruit', label: 'Grapefruit', family: 'citrus' },
  { id: 'rose', label: 'Rose', family: 'floral' },
  { id: 'jasmine', label: 'Jasmine', family: 'floral' },
  { id: 'lavender', label: 'Lavender', family: 'floral' },
  { id: 'iris', label: 'Iris', family: 'floral' },
  { id: 'tuberose', label: 'Tuberose', family: 'floral' },
  { id: 'oud', label: 'Oud', family: 'woody' },
  { id: 'sandalwood', label: 'Sandalwood', family: 'woody' },
  { id: 'cedar', label: 'Cedar', family: 'woody' },
  { id: 'vetiver', label: 'Vetiver', family: 'woody' },
  { id: 'patchouli', label: 'Patchouli', family: 'woody' },
  { id: 'amber', label: 'Amber', family: 'oriental' },
  { id: 'musk', label: 'Musk', family: 'oriental' },
  { id: 'incense', label: 'Incense', family: 'oriental' },
  { id: 'saffron', label: 'Saffron', family: 'oriental' },
  { id: 'vanilla', label: 'Vanilla', family: 'gourmand' },
  { id: 'tonka', label: 'Tonka Bean', family: 'gourmand' },
  { id: 'caramel', label: 'Caramel', family: 'gourmand' },
  { id: 'sea-salt', label: 'Sea Salt', family: 'fresh' },
  { id: 'green-tea', label: 'Green Tea', family: 'fresh' },
  { id: 'mint', label: 'Mint', family: 'fresh' },
];

/** @deprecated Use SUGGESTED_PERFUME_NOTES — kept for older imports */
export const PERFUME_NOTES = SUGGESTED_PERFUME_NOTES;

export function slugifyNoteLabel(label: string): string {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'note'
  );
}

/** Human label from a slug when no catalog entry exists. */
export function formatNoteLabelFromId(id: string): string {
  return String(id || '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function isWellFormedNoteId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

export function resolveNoteLabel(
  id: string,
  catalog?: Array<{ id: string; label: string }>
): string {
  const found = catalog?.find((n) => n.id === id);
  if (found?.label) return found.label;
  const suggested = SUGGESTED_PERFUME_NOTES.find((n) => n.id === id);
  if (suggested) return suggested.label;
  return formatNoteLabelFromId(id);
}

/** @deprecated Prefer resolveNoteLabel with catalog */
export function getPerfumeNoteLabel(id: string): string {
  return resolveNoteLabel(id);
}

/**
 * Normalize raw note ids to unique well-formed slugs.
 * Free-form notes are allowed (not limited to suggested list).
 */
export function normalizePerfumeNoteIds(raw: unknown, max = MAX_PRODUCT_NOTES): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    let id = '';
    if (typeof item === 'string') {
      id = slugifyNoteLabel(item);
    } else if (item && typeof item === 'object' && 'id' in item) {
      id = slugifyNoteLabel(String((item as { id: unknown }).id || ''));
    }
    if (!isWellFormedNoteId(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= max) break;
  }
  return out;
}
