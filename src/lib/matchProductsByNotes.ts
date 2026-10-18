import type { ProductRecord } from '../services/products.service';

export interface ProductNoteMatch {
  product: ProductRecord;
  /** Number of selected notes present on the product */
  score: number;
  matchedNoteIds: string[];
  /** True when every selected note appears on the product */
  perfectMatch: boolean;
}

/**
 * Rank active products by overlap with selected scent notes.
 * Empty selection → empty list.
 */
export function matchProductsByNotes(
  products: ProductRecord[],
  selectedNoteIds: string[]
): ProductNoteMatch[] {
  const selected = Array.from(
    new Set(selectedNoteIds.map((id) => String(id || '').trim().toLowerCase()).filter(Boolean))
  );
  if (selected.length === 0) return [];

  const selectedSet = new Set(selected);

  const matches: ProductNoteMatch[] = [];

  for (const product of products) {
    if (product.status !== 'active') continue;

    const productNotes = Array.isArray(product.notes) ? product.notes : [];
    const matchedNoteIds = productNotes.filter((n) => selectedSet.has(n));
    const score = matchedNoteIds.length;
    if (score < 1) continue;

    matches.push({
      product,
      score,
      matchedNoteIds,
      perfectMatch: score === selected.length,
    });
  }

  return matches.sort((a, b) => {
    if (b.perfectMatch !== a.perfectMatch) return a.perfectMatch ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    // Prefer in-stock
    const aStock = a.product.stock > 0 ? 1 : 0;
    const bStock = b.product.stock > 0 ? 1 : 0;
    if (bStock !== aStock) return bStock - aStock;
    return a.product.name.localeCompare(b.product.name);
  });
}
