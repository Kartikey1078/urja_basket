"use client";

import { useCartStore } from "@/stores/cart-store";
import { cartLineKey } from "@/lib/cart/line-key";

/** Subscribe only to one product line's quantity — avoids grid-wide rerenders. */
export function useCartItemQuantity(productSlug: string, variantSku?: string): number {
  const lineId = cartLineKey(productSlug, variantSku);
  return useCartStore((state) => {
    const item = state.items.find((i) => i.id === lineId || (i.slug === productSlug && !variantSku && !i.variantSku));
    return item?.quantity ?? 0;
  });
}

export function useCartLineId(productSlug: string): string | undefined {
  return useCartStore((state) => state.items.find((i) => i.slug === productSlug)?.id);
}
