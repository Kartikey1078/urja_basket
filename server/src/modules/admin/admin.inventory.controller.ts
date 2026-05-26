import type { Request, Response } from "express";

import { HttpError } from "../../errors/httpError";
import * as productRepo from "../products/repositories/product.repository";
import type { StockStatus } from "./repositories/admin-inventory.repository";
import * as inventoryRepo from "./repositories/admin-inventory.repository";

function paramStr(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parseId(param: string | undefined, label: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return id;
}

const STOCK_STATUSES: StockStatus[] = ["in_stock", "low_stock", "out_of_stock"];

function parseStockStatus(q: unknown): StockStatus | undefined {
  if (typeof q !== "string" || !q.trim()) return undefined;
  const s = q.trim() as StockStatus;
  if (!STOCK_STATUSES.includes(s)) {
    throw new HttpError(400, `Invalid stockStatus. Use: ${STOCK_STATUSES.join(", ")}`);
  }
  return s;
}

export async function adminGetInventorySummary(_req: Request, res: Response) {
  const data = await inventoryRepo.getInventorySummary();
  res.json({ data });
}

export async function adminListInventory(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const categoryIdRaw = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : undefined;
  const stockStatus = parseStockStatus(req.query.stockStatus);
  const sort = typeof req.query.sort === "string" ? req.query.sort : undefined;

  const sortVal =
    sort === "stock_asc" || sort === "stock_desc" || sort === "updated" || sort === "name"
      ? sort
      : undefined;

  const data = await inventoryRepo.listInventoryAdmin({
    q,
    categoryId: categoryId && categoryId > 0 ? categoryId : undefined,
    stockStatus,
    sort: sortVal,
  });
  res.json({ data });
}

export async function adminListInventoryVariants(req: Request, res: Response) {
  const productId = parseId(paramStr(req.params.productId), "product id");
  const product = await productRepo.findProductById(productId);
  if (!product) throw new HttpError(404, "Product not found");
  const data = await inventoryRepo.listVariantsForInventory(productId);
  res.json({ data });
}

export async function adminUpdateProductStock(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "product id");
  const stock = Number((req.body as { stock?: number }).stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    throw new HttpError(400, "stock must be an integer between 0 and 99999");
  }
  const ok = await productRepo.updateProduct(id, { stock });
  if (!ok) throw new HttpError(404, "Product not found");
  res.json({ data: { ok: true, stock } });
}

export async function adminUpdateVariantStock(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "variant id");
  const stock = Number((req.body as { stock?: number }).stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    throw new HttpError(400, "stock must be an integer between 0 and 99999");
  }
  const variant = await productRepo.findVariantById(id);
  if (!variant) throw new HttpError(404, "Variant not found");
  const ok = await productRepo.updateVariant(id, { stock });
  if (!ok) throw new HttpError(404, "Variant not found");
  res.json({ data: { ok: true, stock } });
}
