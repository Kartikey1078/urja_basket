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

let loginMergeInFlight = false;

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
  resetForGuestSession: () => void;
  /** Wipe cart UI + localStorage after a successful order (COD or verified online). */
  clearAfterOrder: () => void;
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
  loadAuthenticatedCart: (
    token: string,
    options?: { allowGuestMerge?: boolean; mergeStrategy?: "add" | "replace" }
  ) => Promise<void>;
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

      resetForGuestSession: () => {
        set({
          items: [],
          mode: "guest",
          bill: null,
          appliedCoupon: null,
          guestCouponCode: null,
          loading: false,
          syncing: false,
          error: null,
        });
      },

      clearAfterOrder: () => {
        const signedIn = get().mode === "authenticated";
        set({
          items: [],
          bill: null,
          appliedCoupon: null,
          guestCouponCode: null,
          loading: false,
          syncing: false,
          error: null,
          mode: signedIn ? "authenticated" : "guest",
        });
        useCartStore.persist.clearStorage();
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
        if (token === undefined) return;
        if (!token) {
          await get().addItem(product, 1, null);
          return;
        }
        // Always POST by slug — server merges quantity; avoids slug-vs-lineItemId mismatch.
        const prev = get().items;
        set({
          loading: true,
          error: null,
          items: mergeGuestAdd(prev, product, 1),
        });
        try {
          const result = await addServerCartItem(token, {
            productSlug: product.slug,
            quantity: 1,
          });
          get().applyServerCart(result.items, result.bill);
        } catch (err) {
          set({ items: prev, loading: false, error: toErrorMessage(err) });
          throw err;
        }
      },

      decreaseQuantity: async (product, token) => {
        const item = get().items.find((i) => i.slug === product.slug);
        if (!item) return;

        if (token === undefined) return;

        if (!token) {
          if (item.quantity <= 1) {
            await get().removeItem(item.id, null);
            return;
          }
          await get().updateQuantity(item.id, item.quantity - 1, null);
          return;
        }

        const lineItemId = await resolveLineItemId(get().items, product.slug, token);
        if (lineItemId == null) return;

        if (item.quantity <= 1) {
          await get().removeItem(String(lineItemId), token);
          return;
        }
        await get().updateQuantity(String(lineItemId), item.quantity - 1, token);
      },

      addItem: async (product, quantity = 1, token) => {
        if (token === undefined) return;
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
        if (token === undefined) return;
        if (quantity < 1) {
          await get().removeItem(id, token);
          return;
        }

        if (token) {
          const prev = get().items;
          const matched = findItemByKey(prev, id);
          let lineItemId = matched ? lineItemIdFromItem(matched) : parseLineItemId(id);

          if (lineItemId == null && matched) {
            lineItemId = await resolveLineItemId(prev, matched.slug, token);
          }

          if (lineItemId == null) {
            set({ error: "Could not update cart item. Refresh and try again." });
            return;
          }

          set({
            loading: true,
            error: null,
            items: prev.map((i) =>
              i.id === id || i.slug === id || i.lineItemId === lineItemId
                ? { ...i, id: String(lineItemId), lineItemId, quantity }
                : i
            ),
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
        if (token === undefined) return;
        if (token) {
          const prev = get().items;
          const matched = findItemByKey(prev, id);
          let lineItemId = matched ? lineItemIdFromItem(matched) : parseLineItemId(id);

          if (lineItemId == null && matched) {
            lineItemId = await resolveLineItemId(prev, matched.slug, token);
          }

          if (lineItemId == null) {
            set({ error: "Could not remove cart item. Refresh and try again." });
            return;
          }

          set({
            loading: true,
            error: null,
            items: prev.filter(
              (i) =>
                i.lineItemId !== lineItemId &&
                i.id !== String(lineItemId) &&
                i.id !== id &&
                i.slug !== id
            ),
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
        if (token === undefined) return;
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
          set({ loading: false, syncing: false, error: toErrorMessage(err) });
          throw err;
        }
      },

      loadAuthenticatedCart: async (token, options) => {
        if (loginMergeInFlight) return;
        loginMergeInFlight = true;

        const allowGuestMerge = options?.allowGuestMerge ?? false;
        const mergeStrategy = options?.mergeStrategy ?? "add";
        const guestItems = get().items.map((item) => ({ ...item }));
        const hasGuestSnapshot =
          allowGuestMerge && get().mode === "guest" && guestItems.length > 0;

        set({ syncing: true, error: null });
        try {
          if (hasGuestSnapshot) {
            const payload = guestItems.map((item) => ({
              productSlug: item.slug,
              quantity: item.quantity,
            }));
            const result = await syncGuestCartToServer(token, payload, { mergeStrategy });
            get().applyServerCart(result.items, result.bill);
          } else {
            await get().fetchCart(token);
          }
          useCartStore.persist.clearStorage();
        } catch (err) {
          set({ syncing: false, error: toErrorMessage(err) });
          throw err;
        } finally {
          loginMergeInFlight = false;
        }
      },

      syncCartAfterLogin: async (token) => {
        await get().loadAuthenticatedCart(token, { allowGuestMerge: true });
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

function parseLineItemId(id: string): number | null {
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function lineItemIdFromItem(item: CartItem): number | null {
  if (item.lineItemId != null && item.lineItemId > 0) return item.lineItemId;
  return parseLineItemId(item.id);
}

function findItemByKey(items: CartItem[], idOrSlug: string): CartItem | undefined {
  return items.find((i) => i.id === idOrSlug || i.slug === idOrSlug);
}

/** Resolve DB line item id — required for PATCH/DELETE. Refreshes from server if local id is still a slug. */
async function resolveLineItemId(
  items: CartItem[],
  productSlug: string,
  token: string
): Promise<number | null> {
  const local = items.find((i) => i.slug === productSlug);
  const fromLocal = local ? lineItemIdFromItem(local) : null;
  if (fromLocal != null) return fromLocal;

  const fresh = await fetchServerCart(token);
  useCartStore.getState().applyServerCart(fresh.items, fresh.bill, fresh.coupon);
  const synced = fresh.items.find((i) => i.slug === productSlug);
  return synced ? lineItemIdFromItem(synced) : null;
}

function toErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Cart operation failed";
}
