"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { computeBillSummary, cartItemCount } from "@/lib/cart/pricing";
import type { BillSummary, CartProductInput } from "@/lib/cart/types";
import { syncCurrentUser } from "@/lib/sync-user";
import { useCartStore } from "@/stores/cart-store";

type CartAuth =
  | { kind: "guest" }
  | { kind: "authenticated"; token: string }
  | { kind: "pending" };

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
  const userSyncedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      userSyncedRef.current = false;
    }
  }, [isSignedIn]);

  const bill = useMemo(() => {
    if (serverBill?.authoritative) return serverBill;
    return computeBillSummary(items);
  }, [items, serverBill]);

  const count = useMemo(() => cartItemCount(items), [items]);

  /**
   * Never treat a signed-in user as guest when Clerk token is momentarily unavailable —
   * that caused local qty bumps to be overwritten by the next server cart fetch.
   */
  const resolveCartAuth = useCallback(async (): Promise<CartAuth> => {
    if (!isLoaded) return { kind: "pending" };
    if (!isSignedIn) return { kind: "guest" };

    let token = await getToken();
    if (!token) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      token = await getToken();
    }
    if (!token) return { kind: "pending" };
    return { kind: "authenticated", token };
  }, [isLoaded, isSignedIn, getToken]);

  const ensureUserSynced = useCallback(async (token: string) => {
    if (userSyncedRef.current) return;
    const user = await syncCurrentUser(token);
    if (user) userSyncedRef.current = true;
  }, []);

  const tokenForStore = useCallback((auth: CartAuth): string | null | undefined => {
    if (auth.kind === "guest") return null;
    if (auth.kind === "pending") return undefined;
    return auth.token;
  }, []);

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
      const auth = await resolveCartAuth();
      if (auth.kind === "pending") return;
      if (auth.kind === "authenticated") await ensureUserSynced(auth.token);
      const token = tokenForStore(auth);
      if (token === undefined) return;
      await addItemStore(product, quantity, token);
    },
    [addItemStore, ensureUserSynced, resolveCartAuth, tokenForStore]
  );

  const increaseQuantity = useCallback(
    async (product: CartProductInput) => {
      const auth = await resolveCartAuth();
      if (auth.kind === "pending") return;
      if (auth.kind === "authenticated") await ensureUserSynced(auth.token);
      const token = tokenForStore(auth);
      if (token === undefined) return;
      await increaseQuantityStore(product, token);
    },
    [ensureUserSynced, increaseQuantityStore, resolveCartAuth, tokenForStore]
  );

  const decreaseQuantity = useCallback(
    async (product: CartProductInput) => {
      const auth = await resolveCartAuth();
      if (auth.kind === "pending") return;
      if (auth.kind === "authenticated") await ensureUserSynced(auth.token);
      const token = tokenForStore(auth);
      if (token === undefined) return;
      await decreaseQuantityStore(product, token);
    },
    [decreaseQuantityStore, ensureUserSynced, resolveCartAuth, tokenForStore]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (syncing || !isLoaded) return;

      const prevTimer = qtyTimers.current.get(id);
      if (prevTimer) clearTimeout(prevTimer);

      const runPersist = (action: (token: string | null) => Promise<void>) => {
        const timer = setTimeout(() => {
          qtyTimers.current.delete(id);
          void (async () => {
            const auth = await resolveCartAuth();
            if (auth.kind === "pending") return;
            if (auth.kind === "authenticated") await ensureUserSynced(auth.token);
            const token = tokenForStore(auth);
            if (token === undefined) return;
            await action(token);
          })();
        }, QTY_DEBOUNCE_MS);
        qtyTimers.current.set(id, timer);
      };

      if (quantity < 1) {
        useCartStore.setState((state) => ({
          items: state.items.filter((i) => i.id !== id && i.slug !== id),
          bill: state.bill?.authoritative ? null : state.bill,
        }));
        runPersist((token) => removeItemStore(id, token));
        return;
      }

      useCartStore.setState((state) => ({
        items: state.items.map((i) =>
          i.id === id || i.slug === id ? { ...i, quantity } : i
        ),
        bill: state.bill?.authoritative ? null : state.bill,
      }));

      runPersist(async (token) => {
        const item = useCartStore.getState().items.find((i) => i.id === id || i.slug === id);
        const targetId =
          item?.lineItemId != null
            ? String(item.lineItemId)
            : Number.isFinite(Number(id)) && Number(id) > 0
              ? id
              : (item?.slug ?? id);
        await updateQuantityStore(targetId, quantity, token);
      });
    },
    [
      ensureUserSynced,
      isLoaded,
      removeItemStore,
      resolveCartAuth,
      syncing,
      tokenForStore,
      updateQuantityStore,
    ]
  );

  const removeItem = useCallback(
    async (id: string) => {
      const prevTimer = qtyTimers.current.get(id);
      if (prevTimer) clearTimeout(prevTimer);
      const auth = await resolveCartAuth();
      if (auth.kind === "pending") return;
      if (auth.kind === "authenticated") await ensureUserSynced(auth.token);
      const token = tokenForStore(auth);
      if (token === undefined) return;
      await removeItemStore(id, token);
    },
    [ensureUserSynced, removeItemStore, resolveCartAuth, tokenForStore]
  );

  const clear = useCallback(async () => {
    const auth = await resolveCartAuth();
    if (auth.kind === "pending") return;
    if (auth.kind === "authenticated") await ensureUserSynced(auth.token);
    const token = tokenForStore(auth);
    if (token === undefined) return;
    await clearCartStore(token);
  }, [clearCartStore, ensureUserSynced, resolveCartAuth, tokenForStore]);

  const fetchCart = useCallback(async () => {
    const auth = await resolveCartAuth();
    if (auth.kind !== "authenticated") return;
    await fetchCartStore(auth.token);
  }, [fetchCartStore, resolveCartAuth]);

  return {
    items: hydrated ? items : [],
    count: hydrated ? count : 0,
    bill: hydrated ? bill : EMPTY_BILL,
    hydrated,
    loading,
    syncing,
    error,
    mode,
    isAuthenticated: isLoaded && isSignedIn,
    authReady: isLoaded && !syncing,
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
