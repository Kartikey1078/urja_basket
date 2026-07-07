import { resolvePublicApiBaseUrl } from "@/lib/api-base-url";

/**
 * Base URL for the Express API (no trailing slash).
 * Browser: same-origin (`""`) — requests go through Next.js rewrites to avoid CORS /
 * "Failed to fetch" when using localhost vs LAN IP. SSR: direct to `NEXT_PUBLIC_API_URL`.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return resolvePublicApiBaseUrl();
}
