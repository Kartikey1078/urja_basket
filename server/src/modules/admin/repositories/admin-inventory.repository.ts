import type { RowDataPacket } from "mysql2";

import { pool } from "../../../database/pool";
import { getSiteSettings } from "../../settings/settings.service";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type InventoryListRow = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  product_stock: number;
  variant_count: number;
  variant_stock_total: number;
  effective_stock: number;
  stock_status: StockStatus;
  is_featured: number;
  is_best_seller: number;
  updated_at: Date;
};

export type InventoryVariantRow = {
  id: number;
  product_id: number;
  weight: string;
  sku: string;
  stock: number;
  price: string;
};

type InventoryPacket = InventoryListRow & RowDataPacket;

const EFFECTIVE_STOCK_SQL = `CASE
  WHEN (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) > 0
  THEN (SELECT COALESCE(SUM(pv.stock), 0) FROM product_variants pv WHERE pv.product_id = p.id)
  ELSE p.stock
END`;

function stockStatusSql(lowStockThreshold: number): string {
  return `CASE
  WHEN ${EFFECTIVE_STOCK_SQL} = 0 THEN 'out_of_stock'
  WHEN ${EFFECTIVE_STOCK_SQL} <= ${lowStockThreshold} THEN 'low_stock'
  ELSE 'in_stock'
END`;
}

export async function listInventoryAdmin(filters?: {
  q?: string;
  categoryId?: number;
  stockStatus?: StockStatus;
  sort?: "name" | "stock_asc" | "stock_desc" | "updated";
}): Promise<InventoryListRow[]> {
  const { lowStockThreshold } = await getSiteSettings();
  const statusSql = stockStatusSql(lowStockThreshold);
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters?.q?.trim()) {
    conditions.push("(p.name LIKE ? OR p.slug LIKE ?)");
    const term = `%${filters.q.trim()}%`;
    params.push(term, term);
  }
  if (filters?.categoryId && filters.categoryId > 0) {
    conditions.push("p.category_id = ?");
    params.push(filters.categoryId);
  }
  if (filters?.stockStatus) {
    conditions.push(`${statusSql} = ?`);
    params.push(filters.stockStatus);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  let orderBy = "p.name ASC";
  switch (filters?.sort) {
    case "stock_asc":
      orderBy = "effective_stock ASC, p.name ASC";
      break;
    case "stock_desc":
      orderBy = "effective_stock DESC, p.name ASC";
      break;
    case "updated":
      orderBy = "p.updated_at DESC";
      break;
    default:
      orderBy = "p.name ASC";
  }

  const [rows] = await pool.query<InventoryPacket[]>(
    `SELECT
      p.id, p.name, p.slug, p.category_id,
      c.name AS category_name, c.slug AS category_slug,
      p.stock AS product_stock,
      (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) AS variant_count,
      (SELECT COALESCE(SUM(pv.stock), 0) FROM product_variants pv WHERE pv.product_id = p.id) AS variant_stock_total,
      ${EFFECTIVE_STOCK_SQL} AS effective_stock,
      ${statusSql} AS stock_status,
      p.is_featured, p.is_best_seller, p.updated_at
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     ${where}
     ORDER BY ${orderBy}`,
    params
  );

  return rows.map((r) => ({
    ...r,
    variant_count: Number(r.variant_count),
    variant_stock_total: Number(r.variant_stock_total),
    effective_stock: Number(r.effective_stock),
  }));
}

export async function listVariantsForInventory(productId: number): Promise<InventoryVariantRow[]> {
  const [rows] = await pool.query<(InventoryVariantRow & RowDataPacket)[]>(
    `SELECT id, product_id, weight, sku, stock, price
     FROM product_variants
     WHERE product_id = ?
     ORDER BY price ASC, id ASC`,
    [productId]
  );
  return rows;
}

export async function getInventorySummary(): Promise<{
  total_products: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
}> {
  const { lowStockThreshold } = await getSiteSettings();
  const statusSql = stockStatusSql(lowStockThreshold);
  const [summaryRows] = await pool.query<
    (RowDataPacket & {
      total_products: number;
      in_stock: number;
      low_stock: number;
      out_of_stock: number;
    })[]
  >(
    `SELECT
      COUNT(*) AS total_products,
      SUM(${statusSql} = 'in_stock') AS in_stock,
      SUM(${statusSql} = 'low_stock') AS low_stock,
      SUM(${statusSql} = 'out_of_stock') AS out_of_stock
     FROM products p`
  );
  const row = summaryRows[0];
  return {
    total_products: Number(row?.total_products ?? 0),
    in_stock: Number(row?.in_stock ?? 0),
    low_stock: Number(row?.low_stock ?? 0),
    out_of_stock: Number(row?.out_of_stock ?? 0),
  };
}
