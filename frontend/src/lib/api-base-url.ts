/** Normalize API base URL from env (no trailing slash, protocol required for rewrites). */
export function normalizeApiBaseUrl(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim().replace(/\/+$/, "");
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

export function resolvePublicApiBaseUrl(): string {
  const normalized = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  if (normalized) return normalized;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required for production builds (include http:// or https://)."
    );
  }
  return "http://localhost:4000";
}
