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

function joinOrigin(origin: string, path: string): string {
  const base = origin.replace(/\/+$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export function catalogImageProxyUrl(
  src: string | null | undefined,
  assetOrigin?: string
): string {
  if (!src?.trim()) return "";
  if (src.startsWith("/")) {
    return assetOrigin ? joinOrigin(assetOrigin, src) : src;
  }
  const proxyPath = `/api/catalog-image?url=${encodeURIComponent(src.trim())}`;
  return assetOrigin ? joinOrigin(assetOrigin, proxyPath) : proxyPath;
}

export function catalogAssetUrl(path: string, assetOrigin?: string): string {
  if (!assetOrigin || path.startsWith("http")) return path;
  return joinOrigin(assetOrigin, path);
}
