import { create } from 'zustand';
import type { Product } from '../types';

/** Hard limit: no more than 3 units of the same product per order. */
export const MAX_QUANTITY_PER_PRODUCT = 3;
export const MAX_QUANTITY_MESSAGE = `Maximum ${MAX_QUANTITY_PER_PRODUCT} per order`;

export interface CartItem extends Product {
  quantity: number;
}

export type AddItemResult =
  | { status: 'added'; addedQuantity: number; currentQuantity: number; requestedQuantity: number }
  | { status: 'partial'; addedQuantity: number; currentQuantity: number; requestedQuantity: number }
  | { status: 'maxed'; addedQuantity: 0; currentQuantity: number; requestedQuantity: number };

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => AddItemResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getItemQuantity: (productId: string | number) => number;
  openCart: () => void;
  closeCart: () => void;
}

const clampQuantity = (quantity: number): number => {
  if (!Number.isFinite(quantity)) return 0;
  return Math.max(0, Math.min(MAX_QUANTITY_PER_PRODUCT, Math.floor(quantity)));
};

const normalizeQuantity = (quantity: number): number => {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(0, Math.floor(quantity));
};

/**
 * Total number of units in the cart (sum of quantities),
 * NOT the number of distinct product lines.
 * Sanitizes invalid quantities so badges can never show NaN / over-cap counts.
 */
export const getCartTotalQuantity = (
  items: readonly { quantity: number }[]
): number =>
  items.reduce((total, item) => total + clampQuantity(item.quantity), 0);

/** Reactive total-units count for badge / header displays. */
export function useCartTotalQuantity(): number {
  return useCartStore((state) => getCartTotalQuantity(state.items));
}

// We use Zustand for the Cart because cart interactions happen very frequently.
// Managing this locally saves hundreds of Firebase read/writes per session.
// We only sync with Firebase when the user actually goes to Checkout!
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  addItem: (product, quantity = 1) => {
    const requestedQuantity = normalizeQuantity(quantity);
    const productId = String(product.id);

    if (requestedQuantity <= 0) {
      return {
        status: 'maxed',
        addedQuantity: 0,
        currentQuantity: get().getItemQuantity(productId),
        requestedQuantity,
      };
    }

    const existing = get().items.find((item) => String(item.id) === productId);
    const currentQuantity = existing ? clampQuantity(existing.quantity) : 0;
    const addedQuantity = Math.min(
      requestedQuantity,
      MAX_QUANTITY_PER_PRODUCT - currentQuantity
    );

    if (addedQuantity <= 0) {
      // Already at the cap — never exceed it, even if callers loop addItem().
      // Also heal any legacy over-cap quantity back down to the max.
      if (existing && existing.quantity !== currentQuantity) {
        set((state) => ({
          items: state.items.map((item) =>
            String(item.id) === productId ? { ...item, quantity: currentQuantity } : item
          ),
        }));
      }
      return {
        status: 'maxed',
        addedQuantity: 0,
        currentQuantity,
        requestedQuantity,
      };
    }

    const nextQuantity = currentQuantity + addedQuantity;

    set((state) => {
      if (existing) {
        return {
          items: state.items.map((item) =>
            String(item.id) === productId
              ? { ...item, id: productId, quantity: nextQuantity }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { ...product, id: productId, quantity: nextQuantity }],
      };
    });

    return {
      status: addedQuantity < requestedQuantity ? 'partial' : 'added',
      addedQuantity,
      currentQuantity: nextQuantity,
      requestedQuantity,
    };
  },
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => String(item.id) !== String(productId)),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return {
          items: state.items.filter((item) => String(item.id) !== String(productId)),
        };
      }
      const clamped = clampQuantity(quantity);
      return {
        items: state.items.map((item) =>
          String(item.id) === String(productId) ? { ...item, quantity: clamped } : item
        ),
      };
    }),
  clearCart: () => set({ items: [] }),
  getCartTotal: () => {
    const items = get().items;
    return items.reduce(
      (total, item) => total + item.price * clampQuantity(item.quantity),
      0
    );
  },
  getCartCount: () => getCartTotalQuantity(get().items),
  getItemQuantity: (productId) => {
    const item = get().items.find((entry) => String(entry.id) === String(productId));
    return item ? clampQuantity(item.quantity) : 0;
  },
}));
