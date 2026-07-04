import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { pool } from "../../database/pool";
import type {
  PosCartLineInput,
  PosOrderItemRow,
  PosOrderRow,
  PosOrderStatus,
  PosPaymentMethod,
  PosPaymentRow,
  PosProductSearchRow,
  PosProductVariant,
} from "./pos.types";

type ProductSearchPacket = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  main_image: string | null;
  stock: number;
  variant_count: number;
};

type VariantPacket = RowDataPacket & {
  id: number;
  product_id: number;
  weight: string;
  sku: string;
  price: string;
  stock: number;
};

type OrderPacket = PosOrderRow & RowDataPacket;
type ItemPacket = PosOrderItemRow & RowDataPacket;
type PaymentPacket = PosPaymentRow & RowDataPacket;

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function generatePosOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, "0");
  return `POS-${date}-${suffix}`;
}

export async function searchPosProducts(query: string, limit = 24): Promise<PosProductSearchRow[]> {
  const term = query.trim();
  if (!term) return [];

  const like = `%${term}%`;
  const [products] = await pool.query<ProductSearchPacket[]>(
    `SELECT
      p.id, p.name, p.slug, p.main_image, p.stock,
      (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) AS variant_count
     FROM products p
     WHERE p.name LIKE ?
        OR p.slug LIKE ?
        OR EXISTS (
          SELECT 1 FROM product_variants pv
          WHERE pv.product_id = p.id AND (pv.sku LIKE ? OR pv.weight LIKE ?)
        )
     ORDER BY p.name ASC
     LIMIT ?`,
    [like, like, like, like, limit]
  );

  if (products.length === 0) return [];

  const ids = products.map((p) => p.id);
  const placeholders = ids.map(() => "?").join(",");
  const [variants] = await pool.query<VariantPacket[]>(
    `SELECT id, product_id, weight, sku, price, stock
     FROM product_variants
     WHERE product_id IN (${placeholders})
     ORDER BY price ASC, id ASC`,
    ids
  );

  const variantsByProduct = new Map<number, PosProductVariant[]>();
  for (const v of variants) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push({
      id: v.id,
      weight: v.weight,
      sku: v.sku,
      price: Number(v.price),
      stock: Number(v.stock),
    });
    variantsByProduct.set(v.product_id, list);
  }

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.main_image,
    productStock: Number(p.stock),
    variantCount: Number(p.variant_count),
    variants: variantsByProduct.get(p.id) ?? [],
  }));
}

export async function resolveCartLine(input: PosCartLineInput): Promise<{
  productId: number;
  variantId: number | null;
  productName: string;
  variantLabel: string | null;
  sku: string | null;
  unitPrice: number;
  stock: number;
  quantity: number;
  lineTotal: number;
}> {
  const quantity = Math.floor(input.quantity);
  if (!Number.isInteger(input.productId) || input.productId <= 0) {
    throw new Error("Invalid product");
  }
  if (quantity < 1 || quantity > 999) {
    throw new Error("Invalid quantity");
  }

  const [productRows] = await pool.query<
    (RowDataPacket & { id: number; name: string; stock: number })[]
  >("SELECT id, name, stock FROM products WHERE id = ? LIMIT 1", [input.productId]);
  const product = productRows[0];
  if (!product) throw new Error("Product not found");

  const [variantCountRows] = await pool.query<(RowDataPacket & { c: number })[]>(
    "SELECT COUNT(*) AS c FROM product_variants WHERE product_id = ?",
    [input.productId]
  );
  const variantCount = Number(variantCountRows[0]?.c ?? 0);

  if (variantCount > 0) {
    const variantId = input.variantId ?? null;
    if (!variantId) throw new Error(`Select a variant for ${product.name}`);
    const [variantRows] = await pool.query<
      (RowDataPacket & { id: number; weight: string; sku: string; price: string; stock: number })[]
    >(
      "SELECT id, weight, sku, price, stock FROM product_variants WHERE id = ? AND product_id = ? LIMIT 1",
      [variantId, input.productId]
    );
    const variant = variantRows[0];
    if (!variant) throw new Error("Variant not found");
    const stock = Number(variant.stock);
    if (quantity > stock) {
      throw new Error(`Only ${stock} in stock for ${product.name} (${variant.weight})`);
    }
    const unitPrice = Number(variant.price);
    return {
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantLabel: variant.weight,
      sku: variant.sku,
      unitPrice,
      stock,
      quantity,
      lineTotal: roundMoney(unitPrice * quantity),
    };
  }

  const stock = Number(product.stock);
  if (quantity > stock) {
    throw new Error(`Only ${stock} in stock for ${product.name}`);
  }
  throw new Error(`${product.name} has no priced variant — add a variant in admin first`);
}

export async function insertPosOrder(
  conn: PoolConnection,
  input: {
    orderNumber: string;
    subtotal: number;
    grandTotal: number;
    items: Awaited<ReturnType<typeof resolveCartLine>>[];
  }
): Promise<number> {
  const [orderResult] = await conn.query<ResultSetHeader>(
    `INSERT INTO pos_orders (order_number, status, subtotal, discount, tax, grand_total)
     VALUES (?, 'pending_payment', ?, 0, 0, ?)`,
    [input.orderNumber, input.subtotal, input.grandTotal]
  );
  const orderId = orderResult.insertId;

  for (const line of input.items) {
    await conn.query(
      `INSERT INTO pos_order_items (
        pos_order_id, product_id, variant_id, product_name, variant_label, sku,
        unit_price, quantity, line_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        line.productId,
        line.variantId,
        line.productName,
        line.variantLabel,
        line.sku,
        line.unitPrice,
        line.quantity,
        line.lineTotal,
      ]
    );
  }

  return orderId;
}

export async function findPosOrderById(id: number): Promise<PosOrderRow | null> {
  const [rows] = await pool.query<OrderPacket[]>(
    `SELECT id, order_number, status, subtotal, discount, tax, grand_total,
            cashier_admin_user_id, notes, created_at, paid_at, cancelled_at
     FROM pos_orders WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function findPosOrderByIdForUpdate(
  conn: PoolConnection,
  id: number
): Promise<PosOrderRow | null> {
  const [rows] = await conn.query<OrderPacket[]>(
    `SELECT id, order_number, status, subtotal, discount, tax, grand_total,
            cashier_admin_user_id, notes, created_at, paid_at, cancelled_at
     FROM pos_orders WHERE id = ? LIMIT 1 FOR UPDATE`,
    [id]
  );
  return rows[0] ?? null;
}

export async function findPosOrderItems(orderId: number, conn?: PoolConnection): Promise<PosOrderItemRow[]> {
  const db = conn ?? pool;
  const [rows] = await db.query<ItemPacket[]>(
    `SELECT id, product_id, variant_id, product_name, variant_label, sku,
            unit_price, quantity, line_total
     FROM pos_order_items WHERE pos_order_id = ?
     ORDER BY id ASC`,
    [orderId]
  );
  return rows;
}

export async function findPosPaymentByOrderId(orderId: number): Promise<PosPaymentRow | null> {
  const [rows] = await pool.query<PaymentPacket[]>(
    `SELECT id, method, status, amount, cash_received, cash_change, created_at, completed_at
     FROM pos_payments WHERE pos_order_id = ?
     ORDER BY id DESC LIMIT 1`,
    [orderId]
  );
  return rows[0] ?? null;
}

export async function listPosOrders(filters?: {
  q?: string;
  status?: PosOrderStatus;
  limit?: number;
  offset?: number;
}): Promise<{ items: PosOrderRow[]; total: number }> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters?.q?.trim()) {
    conditions.push("order_number LIKE ?");
    params.push(`%${filters.q.trim()}%`);
  }
  if (filters?.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 50));
  const offset = Math.max(0, filters?.offset ?? 0);

  const [countRows] = await pool.query<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total FROM pos_orders ${where}`,
    params
  );
  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await pool.query<OrderPacket[]>(
    `SELECT id, order_number, status, subtotal, discount, tax, grand_total,
            cashier_admin_user_id, notes, created_at, paid_at, cancelled_at
     FROM pos_orders ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { items: rows, total };
}

export async function markPosOrderPaid(conn: PoolConnection, orderId: number): Promise<void> {
  await conn.query(
    `UPDATE pos_orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [orderId]
  );
}

export async function markPosOrderCancelled(conn: PoolConnection, orderId: number): Promise<void> {
  await conn.query(
    `UPDATE pos_orders SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [orderId]
  );
}

export async function insertPosPayment(
  conn: PoolConnection,
  input: {
    orderId: number;
    method: PosPaymentMethod;
    amount: number;
    cashReceived?: number;
    cashChange?: number;
  }
): Promise<void> {
  await conn.query(
    `INSERT INTO pos_payments (
      pos_order_id, method, status, amount, cash_received, cash_change, completed_at
    ) VALUES (?, ?, 'success', ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      input.orderId,
      input.method,
      input.amount,
      input.cashReceived ?? null,
      input.cashChange ?? null,
    ]
  );
}

export async function insertInventoryMovement(
  conn: PoolConnection,
  input: {
    productId: number;
    variantId: number | null;
    delta: number;
    reason: "pos_sale" | "pos_cancel_restore";
    orderId: number;
  }
): Promise<void> {
  await conn.query(
    `INSERT INTO inventory_movements (
      product_id, variant_id, delta, reason, reference_type, reference_id
    ) VALUES (?, ?, ?, ?, 'pos_order', ?)`,
    [input.productId, input.variantId, input.delta, input.reason, input.orderId]
  );
}
