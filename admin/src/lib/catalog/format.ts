export function formatCatalogDate(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function formatCatalogInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Rate-list style: ₹169/- */
export function formatCatalogRatePrice(amount: number): string {
  return `${formatCatalogInr(amount)}/-`;
}

export function catalogImageProxyUrl(src: string | null | undefined): string {
  if (!src?.trim()) return "";
  if (src.startsWith("/")) return src;
  return `/api/catalog-image?url=${encodeURIComponent(src.trim())}`;
}
