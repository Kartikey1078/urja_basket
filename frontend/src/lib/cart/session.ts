const MERGE_PREFIX = "urja-cart-merged";
const GUEST_SESSION_PREFIX = "urja-guest-session";

export function cartMergeSessionKey(userId: string): string {
  return `${MERGE_PREFIX}:${userId}`;
}

export function hasMergedGuestCartThisSession(userId: string): boolean {
  if (typeof sessionStorage === "undefined") return true;
  return sessionStorage.getItem(cartMergeSessionKey(userId)) === "1";
}

export function markGuestCartMerged(userId: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(cartMergeSessionKey(userId), "1");
}

export function clearCartMergeSession(userId: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(cartMergeSessionKey(userId));
}

/** Set when user signs out — guest cart after logout should replace DB lines on login, not add to them. */
export function startGuestSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(GUEST_SESSION_PREFIX, "1");
}

export function hasActiveGuestSession(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(GUEST_SESSION_PREFIX) === "1";
}

export function clearGuestSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(GUEST_SESSION_PREFIX);
}
