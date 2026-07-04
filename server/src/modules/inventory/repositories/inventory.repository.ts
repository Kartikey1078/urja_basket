import type { PoolConnection, RowDataPacket } from "mysql2/promise";

import { pool } from "../../../database/pool";

export type StockLineCheck = {
  ok: boolean;
  available: number;
  hasVariants: boolean;
  variantId: number | null;
};

type CountRow = RowDataPacket & { c: number };
type StockRow = RowDataPacket & { stock: number };
type VariantRow = RowDataPacket & { id: number; stock: number; weight: string };

export async function countVariants(productId: number): Promise<number> {
  const [rows] = await pool.query<CountRow[]>(
    "SELECT COUNT(*) AS c FROM product_variants WHERE product_id = ?",
    [productId]
  );
  return Number(rows[0]?.c ?? 0);
}

export async function findVariantByProductAndWeight(
  productId: number,
  weight: string | null
): Promise<{ id: number; stock: number } | null> {
  if (weight?.trim()) {
    const [exact] = await pool.query<VariantRow[]>(
      `SELECT id, stock, weight FROM product_variants
       WHERE product_id = ? AND weight = ?
       LIMIT 1`,
      [productId, weight.trim()]
    );
    if (exact[0]) {
      return { id: exact[0].id, stock: Number(exact[0].stock) };
    }
  }

  const [rows] = await pool.query<VariantRow[]>(
    `SELECT id, stock, weight FROM product_variants
     WHERE product_id = ?
     ORDER BY stock DESC, price ASC, id ASC
     LIMIT 1`,
    [productId]
  );
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, stock: Number(row.stock) };
}

export async function getProductStock(productId: number): Promise<number> {
  const [rows] = await pool.query<StockRow[]>(
    "SELECT stock FROM products WHERE id = ? LIMIT 1",
    [productId]
  );
  return Number(rows[0]?.stock ?? 0);
}

export async function checkLineAvailability(
  productId: number,
  subtitle: string | null,
  quantity: number
): Promise<StockLineCheck> {
  const variantCount = await countVariants(productId);
  if (variantCount > 0) {
    const variant = await findVariantByProductAndWeight(productId, subtitle);
    const available = variant?.stock ?? 0;
    return {
      ok: available >= quantity,
      available,
      hasVariants: true,
      variantId: variant?.id ?? null,
    };
  }

  const available = await getProductStock(productId);
  return {
    ok: available >= quantity,
    available,
    hasVariants: false,
    variantId: null,
  };
}

async function resolveDeductionTarget(
  productId: number,
  subtitle: string | null
): Promise<{ hasVariants: boolean; variantId: number | null }> {
  const variantCount = await countVariants(productId);
  if (variantCount === 0) {
    return { hasVariants: false, variantId: null };
  }
  const variant = await findVariantByProductAndWeight(productId, subtitle);
  return { hasVariants: true, variantId: variant?.id ?? null };
}

export async function deductLineStock(
  conn: PoolConnection,
  productId: number,
  subtitle: string | null,
  quantity: number
): Promise<void> {
  const target = await resolveDeductionTarget(productId, subtitle);
  if (target.hasVariants) {
    if (!target.variantId) {
      throw new Error(`No variant found for product ${productId}`);
    }
    const [result] = await conn.query(
      `UPDATE product_variants
       SET stock = stock - ?
       WHERE id = ? AND stock >= ?`,
      [quantity, target.variantId, quantity]
    );
    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affected === 0) {
      throw new Error(`Insufficient variant stock for product ${productId}`);
    }
    await conn.query("UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      productId,
    ]);
    return;
  }

  const [result] = await conn.query(
    `UPDATE products
     SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND stock >= ?`,
    [quantity, productId, quantity]
  );
  const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
  if (affected === 0) {
    throw new Error(`Insufficient product stock for product ${productId}`);
  }
}

export async function restoreLineStock(
  conn: PoolConnection,
  productId: number,
  subtitle: string | null,
  quantity: number
): Promise<void> {
  const target = await resolveDeductionTarget(productId, subtitle);
  if (target.hasVariants && target.variantId) {
    await conn.query(
      "UPDATE product_variants SET stock = stock + ? WHERE id = ?",
      [quantity, target.variantId]
    );
    await conn.query("UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      productId,
    ]);
    return;
  }

  await conn.query(
    "UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [quantity, productId]
  );
}
