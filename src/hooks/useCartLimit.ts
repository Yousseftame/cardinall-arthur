import { MAX_QUANTITY_PER_PRODUCT, useCartStore } from '../store/cartStore';

export interface CartLimit {
  /** Units of this product already in the cart (0–3). */
  inCartQuantity: number;
  /** How many more units can still be added (0–3). */
  remainingQuantity: number;
  /** True when the cart already holds the maximum for this product. */
  isAtMax: boolean;
  maxQuantity: number;
}

/**
 * Reactive per-product cart limit.
 * Re-renders only when this product's cart quantity changes, so quantity
 * pickers stay in sync even if the item was added from another surface.
 */
export function useCartLimit(
  productId: string | number | null | undefined
): CartLimit {
  const inCartQuantity = useCartStore((state) => {
    if (productId === null || productId === undefined) return 0;
    const item = state.items.find((entry) => String(entry.id) === String(productId));
    if (!item || !Number.isFinite(item.quantity)) return 0;
    return Math.max(
      0,
      Math.min(MAX_QUANTITY_PER_PRODUCT, Math.floor(item.quantity))
    );
  });

  const remainingQuantity = Math.max(
    0,
    MAX_QUANTITY_PER_PRODUCT - inCartQuantity
  );

  return {
    inCartQuantity,
    remainingQuantity,
    isAtMax: remainingQuantity === 0,
    maxQuantity: MAX_QUANTITY_PER_PRODUCT,
  };
}

/** Cap a desired picker quantity to what can still be added. */
export function capPickerQuantity(
  desired: number,
  remainingQuantity: number
): number {
  if (remainingQuantity <= 0) return 1;
  if (!Number.isFinite(desired)) return 1;
  return Math.max(1, Math.min(Math.floor(desired), remainingQuantity));
}
