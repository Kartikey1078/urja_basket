"use client";

import { useCartStore } from "@/stores/cart-store";

/** Subscribe only to one product's quantity — avoids grid-wide rerenders. */
export function useCartItemQuantity(productSlug: string): number {
  return useCartStore((state) => {
    const item = state.items.find((i) => i.slug === productSlug);
    return item?.quantity ?? 0;
  });
}

export function useCartLineId(productSlug: string): string | undefined {
  return useCartStore((state) => state.items.find((i) => i.slug === productSlug)?.id);
}
