/** Return here after sign-in when checkout was interrupted. */
export const CHECKOUT_RETURN_PATH = "/cart?checkout=1";

/** Build a login URL that returns the user to a safe in-app path after auth. */
export function loginUrl(returnTo: string = CHECKOUT_RETURN_PATH): string {
  return `/login?redirect_url=${encodeURIComponent(returnTo)}`;
}

/** Only allow same-origin relative paths (blocks open redirects). */
export function safeRedirectPath(
  url: string | null | undefined,
  fallback = "/"
): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}
