import type { WishlistItem } from "./types";

export const WISHLIST_STORAGE_KEY = "urja-basket-wishlist-v1";

function isWishlistItem(value: unknown): value is WishlistItem {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    typeof o.image === "string"
  );
}

/** Read wishlist from localStorage (browser only). Returns [] on server or parse errors. */
export function readWishlistFromStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];
    const state = parsed as { state?: { items?: unknown } };
    const items = state.state?.items ?? (parsed as { items?: unknown }).items;
    if (!Array.isArray(items)) return [];
    return items.filter(isWishlistItem);
  } catch {
    return [];
  }
}

/** Persist wishlist items to localStorage. */
export function writeWishlistToStorage(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ state: { items }, version: 1 });
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, payload);
  } catch {
    // Quota exceeded or private mode — fail silently
  }
}
