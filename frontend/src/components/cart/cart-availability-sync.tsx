"use client";

import { useCartAvailabilitySync } from "@/hooks/use-cart-availability-sync";

export function CartAvailabilitySync() {
  useCartAvailabilitySync();
  return null;
}
