import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  addServerCartItem,
  fetchServerCart,
  removeServerCartItem,
  syncGuestCartToServer,
  updateServerCartItem,
} from "@/lib/cart/api";
import { CART_STORAGE_KEY } from "@/lib/cart/constants";
import { productToCartItem } from "@/lib/cart/pricing";
import type {
  AppliedCartCoupon,
  BillSummary,
  CartItem,
  CartMode,
  CartProductInput,
} from "@/lib/cart/types";

type CartState = {
  items: CartItem[];
  bill: BillSummary | null;
  appliedCoupon: AppliedCartCoupon | null;
  guestCouponCode: string | null;
  mode: CartMode;
  loading: boolean;
  syncing: boolean;
  error: string | null;

  setGuestItems: (items: CartItem[]) => void;
  applyServerCart: (
    items: CartItem[],
    bill: BillSummary,
    coupon?: AppliedCartCoupon | null
  ) => void;
  setGuestCouponCode: (code: string | null) => void;

  getItemQuantity: (productSlug: string) => number;
  addItem: (product: CartProductInput, quantity?: number, token?: string | null) => Promise<void>;
  increaseQuantity: (product: CartProductInput, token?: string | null) => Promise<void>;
  decreaseQuantity: (product: CartProductInput, token?: string | null) => Promise<void>;
  updateQuantity: (id: string, quantity: number, token?: string | null) => Promise<void>;
  removeItem: (id: string, token?: string | null) => Promise<void>;
  clearCart: (token?: string | null) => Promise<void>;
  fetchCart: (token: string) => Promise<void>;
  syncCartAfterLogin: (token: string) => Promise<void>;
  loadAuthenticatedCart: (token: string, options?: { allowGuestMerge?: boolean }) => Promise<void>;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      bill: null,
      appliedCoupon: null,
      guestCouponCode: null,
      mode: "guest",
      loading: false,
      syncing: false,
      error: null,

      setGuestItems: (items) => {
        set({ items, mode: "guest", bill: null, appliedCoupon: null, error: null });
      },

      setGuestCouponCode: (guestCouponCode) => set({ guestCouponCode }),

      applyServerCart: (items, bill, coupon = null) => {
        set({
          items,
          bill: { ...bill, authoritative: true },
          appliedCoupon: coupon,
          guestCouponCode: coupon?.code ?? null,
          mode: "authenticated",
          loading: false,
          syncing: false,
          error: null,
        });
      },

      getItemQuantity: (productSlug) => {
        const item = get().items.find((i) => i.slug === productSlug);
        return item?.quantity ?? 0;
      },

      increaseQuantity: async (product, token) => {
        const current = get().getItemQuantity(product.slug);
        if (current === 0) {
          await get().addItem(product, 1, token);
          return;
        }
        const item = get().items.find((i) => i.slug === product.slug);
        if (!item) return;
        await get().updateQuantity(item.id, item.quantity + 1, token);
      },

      decreaseQuantity: async (product, token) => {
        const item = get().items.find((i) => i.slug === product.slug);
        if (!item) return;
        if (item.quantity <= 1) {
          await get().removeItem(item.id, token);
          return;
        }
        await get().updateQuantity(item.id, item.quantity - 1, token);
      },

      addItem: async (product, quantity = 1, token) => {
        if (token) {
          const prev = get().items;
          set({
            loading: true,
            error: null,
            items: mergeGuestAdd(prev, product, quantity),
          });
          try {
            const result = await addServerCartItem(token, {
              productSlug: product.slug,
              quantity,
            });
            get().applyServerCart(result.items, result.bill);
          } catch (err) {
            set({ items: prev, loading: false, error: toErrorMessage(err) });
            throw err;
          }
          return;
        }

        set((state) => ({
          mode: "guest",
          bill: null,
          items: mergeGuestAdd(state.items, product, quantity),
        }));
      },

      updateQuantity: async (id, quantity, token) => {
        if (quantity < 1) {
          await get().removeItem(id, token);
          return;
        }

        if (token) {
          const lineItemId = Number(id);
          if (!Number.isFinite(lineItemId)) return;
          const prev = get().items;
          set({
            loading: true,
            error: null,
            items: prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
          });
          try {
            const result = await updateServerCartItem(token, lineItemId, quantity);
            get().applyServerCart(result.items, result.bill);
          } catch (err) {
            set({ items: prev, loading: false, error: toErrorMessage(err) });
            throw err;
          }
          return;
        }

        set((state) => ({
          mode: "guest",
          bill: null,
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      removeItem: async (id, token) => {
        if (token) {
          const lineItemId = Number(id);
          if (!Number.isFinite(lineItemId)) return;
          const prev = get().items;
          set({
            loading: true,
            error: null,
            items: prev.filter((i) => i.id !== id),
          });
          try {
            const result = await removeServerCartItem(token, lineItemId);
            get().applyServerCart(result.items, result.bill);
          } catch (err) {
            set({ items: prev, loading: false, error: toErrorMessage(err) });
            throw err;
          }
          return;
        }

        set((state) => ({
          mode: "guest",
          bill: null,
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      clearCart: async (token) => {
        if (token) {
          const { items } = get();
          set({ loading: true, error: null });
          try {
            for (const item of items) {
              if (item.lineItemId) {
                await removeServerCartItem(token, item.lineItemId);
              }
            }
            await get().fetchCart(token);
          } catch (err) {
            set({ loading: false, error: toErrorMessage(err) });
            throw err;
          }
          return;
        }
        set({ items: [], mode: "guest", bill: null, error: null });
      },

      fetchCart: async (token) => {
        set({ loading: true, error: null });
        try {
          const result = await fetchServerCart(token);
          get().applyServerCart(result.items, result.bill, result.coupon);
        } catch (err) {
          set({ loading: false, error: toErrorMessage(err) });
          throw err;
        }
      },

      loadAuthenticatedCart: async (token, options) => {
        const allowGuestMerge = options?.allowGuestMerge ?? false;
        const guestItems = get().items;
        const hasGuestSnapshot =
          allowGuestMerge && get().mode === "guest" && guestItems.length > 0;

        if (!hasGuestSnapshot) {
          await get().fetchCart(token);
          useCartStore.persist.clearStorage();
          return;
        }

        set({ syncing: true, error: null, mode: "authenticated" });
        try {
          const serverPeek = await fetchServerCart(token);
          if (serverPeek.items.length === 0) {
            const payload = guestItems.map((item) => ({
              productSlug: item.slug,
              quantity: item.quantity,
            }));
            const result = await syncGuestCartToServer(token, payload);
            get().applyServerCart(result.items, result.bill);
          } else {
            get().applyServerCart(serverPeek.items, serverPeek.bill);
          }
          useCartStore.persist.clearStorage();
        } catch (err) {
          set({ syncing: false, error: toErrorMessage(err) });
          throw err;
        }
      },

      syncCartAfterLogin: async (token) => {
        const guestItems = get().items.map((item) => ({
          productSlug: item.slug,
          quantity: item.quantity,
        }));

        set({ syncing: true, error: null, mode: "authenticated" });
        try {
          if (guestItems.length > 0) {
            const result = await syncGuestCartToServer(token, guestItems);
            get().applyServerCart(result.items, result.bill);
          } else {
            await get().fetchCart(token);
          }

          useCartStore.persist.clearStorage();
        } catch (err) {
          set({ syncing: false, error: toErrorMessage(err) });
          throw err;
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        state.mode === "guest"
          ? { items: state.items, mode: state.mode }
          : { items: [], mode: "authenticated" },
    }
  )
);

function mergeGuestAdd(
  items: CartItem[],
  product: CartProductInput,
  quantity: number
): CartItem[] {
  const existing = items.find((i) => i.slug === product.slug);
  if (existing) {
    return items.map((i) =>
      i.slug === product.slug ? { ...i, quantity: i.quantity + quantity } : i
    );
  }
  return [...items, productToCartItem(product, quantity)];
}

function toErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Cart operation failed";
}
