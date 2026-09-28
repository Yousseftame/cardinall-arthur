import { create } from 'zustand';
import type { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  openCart: () => void;
  closeCart: () => void;
}

// We use Zustand for the Cart because cart interactions happen very frequently.
// Managing this locally saves hundreds of Firebase read/writes per session.
// We only sync with Firebase when the user actually goes to Checkout!
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  addItem: (product) => set((state) => {
    const existing = state.items.find(item => item.id === product.id);
    if (existing) {
      return { 
        items: state.items.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ) 
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.id !== productId)
  })),
  clearCart: () => set({ items: [] }),
  getCartTotal: () => {
    const items = get().items;
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
