import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { WISHLIST_STORAGE_KEY } from "@/lib/wishlist/storage";
import { type WishlistItem, type WishlistProductInput, toWishlistItem } from "@/lib/wishlist/types";

type WishlistState = {
  items: WishlistItem[];
  toggle: (product: WishlistProductInput) => void;
  remove: (slug: string) => void;
  clear: () => void;
  isWishlisted: (slug: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      isWishlisted: (slug) => get().items.some((i) => i.slug === slug),

      toggle: (product) => {
        set((state) => {
          const exists = state.items.some((i) => i.slug === product.slug);
          if (exists) {
            return { items: state.items.filter((i) => i.slug !== product.slug) };
          }
          return { items: [...state.items, toWishlistItem(product)] };
        });
      },

      remove: (slug) => {
        set((state) => ({
          items: state.items.filter((i) => i.slug !== slug),
        }));
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: WISHLIST_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
