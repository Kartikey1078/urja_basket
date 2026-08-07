import { HttpError } from "../../../errors/httpError";
import type { GuestSyncItem } from "../cart.types";

export function parsePositiveInt(value: unknown, field: string): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n) || n < 1) {
    throw new HttpError(400, `${field} must be a positive integer`);
  }
  return n;
}

export function parseAddItemBody(body: unknown): {
  productId?: number;
  productSlug?: string;
  variantSku?: string;
  quantity: number;
} {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Invalid request body");
  }
  const record = body as Record<string, unknown>;
  const quantity =
    record.quantity === undefined ? 1 : parsePositiveInt(record.quantity, "quantity");

  const productId =
    record.productId !== undefined ? parsePositiveInt(record.productId, "productId") : undefined;
  const productSlug =
    typeof record.productSlug === "string" && record.productSlug.trim()
      ? record.productSlug.trim()
      : undefined;
  const variantSku =
    typeof record.variantSku === "string" && record.variantSku.trim()
      ? record.variantSku.trim()
      : undefined;

  if (productId === undefined && !productSlug) {
    throw new HttpError(400, "productId or productSlug is required");
  }

  return { productId, productSlug, variantSku, quantity };
}

export function parseUpdateQuantityBody(body: unknown): { quantity: number } {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Invalid request body");
  }
  const record = body as Record<string, unknown>;
  return { quantity: parsePositiveInt(record.quantity, "quantity") };
}

export function parseSyncBody(body: unknown): {
  items: GuestSyncItem[];
  mergeStrategy: "add" | "replace";
} {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Invalid request body");
  }
  const record = body as Record<string, unknown>;
  if (!Array.isArray(record.items)) {
    throw new HttpError(400, "items array is required");
  }

  const mergeStrategy = record.mergeStrategy === "replace" ? "replace" : "add";

  const items: GuestSyncItem[] = [];
  for (const raw of record.items) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const productSlug =
      typeof row.productSlug === "string"
        ? row.productSlug
        : typeof row.slug === "string"
          ? row.slug
          : "";
    if (!productSlug.trim()) continue;
    const quantity =
      row.quantity === undefined ? 1 : parsePositiveInt(row.quantity, "quantity");
    const variantSku =
      typeof row.variantSku === "string" && row.variantSku.trim()
        ? row.variantSku.trim()
        : typeof row.sku === "string" && row.sku.trim()
          ? row.sku.trim()
          : undefined;
    items.push({ productSlug: productSlug.trim(), quantity, variantSku });
  }

  return { items, mergeStrategy };
}
