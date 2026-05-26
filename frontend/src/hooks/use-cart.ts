"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { computeBillSummary, cartItemCount } from "@/lib/cart/pricing";
import type { BillSummary, CartProductInput } from "@/lib/cart/types";
import { useCartStore } from "@/stores/cart-store";

const QTY_DEBOUNCE_MS = 400;
const EMPTY_BILL: BillSummary = computeBillSummary([]);

function useCartPersistHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}

export function useCart() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const items = useCartStore((s) => s.items);
  const serverBill = useCartStore((s) => s.bill);
  const loading = useCartStore((s) => s.loading);
  const syncing = useCartStore((s) => s.syncing);
  const error = useCartStore((s) => s.error);
  const mode = useCartStore((s) => s.mode);
  const addItemStore = useCartStore((s) => s.addItem);
  const increaseQuantityStore = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantityStore = useCartStore((s) => s.decreaseQuantity);
  const updateQuantityStore = useCartStore((s) => s.updateQuantity);
  const removeItemStore = useCartStore((s) => s.removeItem);
  const clearCartStore = useCartStore((s) => s.clearCart);
  const fetchCartStore = useCartStore((s) => s.fetchCart);

  const hydrated = useCartPersistHydrated();
  const qtyTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const bill = useMemo(() => {
    if (serverBill?.authoritative) return serverBill;
    return computeBillSummary(items);
  }, [items, serverBill]);

  const count = useMemo(() => cartItemCount(items), [items]);

  const resolveToken = useCallback(async () => {
    if (!isSignedIn) return null;
    return getToken();
  }, [isSignedIn, getToken]);

  /* Authenticated cart load runs in ClerkUserSync only (avoids duplicate fetch + guest merge on refresh). */

  const getItemQuantity = useCallback(
    (productSlug: string) => {
      const item = items.find((i) => i.slug === productSlug);
      return item?.quantity ?? 0;
    },
    [items]
  );

  const addItem = useCallback(
    async (product: CartProductInput, quantity?: number) => {
      const token = await resolveToken();
      await addItemStore(product, quantity, token);
    },
    [addItemStore, resolveToken]
  );

  const increaseQuantity = useCallback(
    async (product: CartProductInput) => {
      const token = await resolveToken();
      await increaseQuantityStore(product, token);
    },
    [increaseQuantityStore, resolveToken]
  );

  const decreaseQuantity = useCallback(
    async (product: CartProductInput) => {
      const token = await resolveToken();
      await decreaseQuantityStore(product, token);
    },
    [decreaseQuantityStore, resolveToken]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      const prevTimer = qtyTimers.current.get(id);
      if (prevTimer) clearTimeout(prevTimer);

      useCartStore.setState((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        bill: state.bill?.authoritative ? null : state.bill,
      }));

      const timer = setTimeout(() => {
        qtyTimers.current.delete(id);
        void (async () => {
          const token = await resolveToken();
          await updateQuantityStore(id, quantity, token);
        })();
      }, QTY_DEBOUNCE_MS);

      qtyTimers.current.set(id, timer);
    },
    [updateQuantityStore, resolveToken]
  );

  const removeItem = useCallback(
    async (id: string) => {
      const prevTimer = qtyTimers.current.get(id);
      if (prevTimer) clearTimeout(prevTimer);
      const token = await resolveToken();
      await removeItemStore(id, token);
    },
    [removeItemStore, resolveToken]
  );

  const clear = useCallback(async () => {
    const token = await resolveToken();
    await clearCartStore(token);
  }, [clearCartStore, resolveToken]);

  const fetchCart = useCallback(async () => {
    const token = await resolveToken();
    if (!token) return;
    await fetchCartStore(token);
  }, [fetchCartStore, resolveToken]);

  return {
    items: hydrated ? items : [],
    count: hydrated ? count : 0,
    bill: hydrated ? bill : EMPTY_BILL,
    hydrated,
    loading,
    syncing,
    error,
    mode,
    isAuthenticated: isSignedIn,
    getItemQuantity,
    addItem,
    increaseQuantity,
    decreaseQuantity,
    setQuantity: updateQuantity,
    removeItem,
    clear,
    fetchCart,
  };
}
