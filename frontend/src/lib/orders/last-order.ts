import type { LastOrderRef } from "./types";

const KEY = "urja-last-order-v1";

export function saveLastOrder(ref: LastOrderRef) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(ref));
}

export function getLastOrder(): LastOrderRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastOrderRef;
  } catch {
    return null;
  }
}

export function clearLastOrder() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
