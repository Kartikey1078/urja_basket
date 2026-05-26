/**
 * Base URL for the Express API (no trailing slash).
 * Set in `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:4000`
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return raw.replace(/\/+$/, "");
}
