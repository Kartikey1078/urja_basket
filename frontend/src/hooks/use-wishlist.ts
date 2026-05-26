"use client";

import { useCallback, useEffect, useState } from "react";

import type { WishlistProductInput } from "@/lib/wishlist/types";
import { useWishlistStore } from "@/stores/wishlist-store";

/**
 * Hydration-safe wishlist hook. `isWishlisted` is false until client storage is rehydrated.
 */
export function useWishlist() {
  const [hydrated, setHydrated] = useState(false);

  const items = useWishlistStore((s) => s.items);
  const toggleStore = useWishlistStore((s) => s.toggle);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);

  useEffect(() => {
    const unsub = useWishlistStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    void useWishlistStore.persist.rehydrate();
    return unsub;
  }, []);

  const isWishlisted = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

  const toggle = useCallback(
    (product: WishlistProductInput) => {
      toggleStore(product);
    },
    [toggleStore]
  );

  return {
    items,
    hydrated,
    count: hydrated ? items.length : 0,
    isWishlisted,
    toggle,
    remove,
    clear,
  };
}
