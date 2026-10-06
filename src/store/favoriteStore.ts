import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface FavoriteState {
  items: Product[];
  toggleItem: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => set((state) => {
        const existing = state.items.find(item => item.id === product.id);
        if (existing) {
          return { items: state.items.filter(item => item.id !== product.id) };
        }
        return { items: [...state.items, product] };
      }),
      isFavorite: (productId) => get().items.some(item => item.id === productId),
    }),
    {
      name: 'favorites-storage', // key in localStorage
    }
  )
);
