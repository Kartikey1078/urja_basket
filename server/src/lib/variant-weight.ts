/** Normalize variant weight labels to grams for "largest variant" comparisons. */
export function parseWeightSortValue(weight: string): number {
  const raw = weight.trim().toLowerCase();
  const match = raw.match(/^([\d.]+)\s*(kg|g|gm|gram|grams|pc|pcs|piece|pieces|pack|pkt|unit|units)?/);
  if (!match) return 0;

  const num = Number.parseFloat(match[1]);
  if (!Number.isFinite(num) || num <= 0) return 0;

  const unit = match[2] ?? "g";
  if (unit === "kg") return num * 1000;
  if (unit === "g" || unit === "gm" || unit === "gram" || unit === "grams") return num;
  if (
    unit === "pc" ||
    unit === "pcs" ||
    unit === "piece" ||
    unit === "pieces" ||
    unit === "pack" ||
    unit === "pkt" ||
    unit === "unit" ||
    unit === "units"
  ) {
    return num * 1000;
  }
  return num;
}
