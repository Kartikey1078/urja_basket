/** Parse `nutrition_tags` from MySQL JSON column (object or string). */
export function parseNutritionTags(raw: unknown): string[] {
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

/** Normalize admin/API input into a deduplicated string array. */
export function normalizeNutritionTagsInput(input: unknown): string[] {
  if (input == null) return [];
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") continue;
    const tag = item.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out.sort((a, b) => a.localeCompare(b));
}
