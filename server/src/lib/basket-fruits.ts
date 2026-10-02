export const BASKET_FRUITS_MAX = 12;

/** Parse `basket_fruits` from MySQL JSON column. */
export function parseBasketFruits(raw: unknown): string[] {
  if (raw == null) return [];
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => (typeof item === "string" ? item.trim() : String(item).trim()))
    .filter((item) => item.length > 0);
}

/** Normalize admin/API input — preserves order, dedupes case-insensitively, max 12 names. */
export function normalizeBasketFruitsInput(input: unknown): string[] {
  if (input == null) return [];
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") continue;
    const name = item.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
    if (out.length >= BASKET_FRUITS_MAX) break;
  }
  return out;
}
