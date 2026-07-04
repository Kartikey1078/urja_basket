import type { LastOrderRef } from "./types";

const KEY = "urja-active-order-v1";

/** Persisted until order is delivered — powers the floating track button. */
export function saveActiveOrder(ref: LastOrderRef) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(ref));
}

export function getActiveOrder(): LastOrderRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastOrderRef;
  } catch {
    return null;
  }
}

export function clearActiveOrder() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
