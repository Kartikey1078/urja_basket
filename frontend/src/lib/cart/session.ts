const MERGE_PREFIX = "urja-cart-merged";

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
