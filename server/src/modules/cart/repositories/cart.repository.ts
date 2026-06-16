import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../database/pool";
import { isMissingCouponSchemaError } from "../../../lib/coupon-schema";

export type ProductCartRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  main_image: string | null;
  is_organic: number;
  is_best_seller: number;
  card_weight: string | null;
  card_price: string | null;
  card_original_price: string | null;
};

export type CartItemRow = RowDataPacket & {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  slug: string;
  name: string;
  main_image: string | null;
  is_organic: number;
  is_best_seller: number;
  card_weight: string | null;
  card_price: string | null;
  card_original_price: string | null;
};

const CARD_PRICE_SQL = `(
  SELECT pv.price FROM product_variants pv
  WHERE pv.product_id = p.id
  ORDER BY pv.price ASC
  LIMIT 1
)`;

const CARD_ORIGINAL_SQL = `(
  SELECT COALESCE(pv.original_price, pv.price) FROM product_variants pv
  WHERE pv.product_id = p.id
  ORDER BY pv.price ASC
  LIMIT 1
)`;

const CARD_WEIGHT_SQL = `(
  SELECT pv.weight FROM product_variants pv
  WHERE pv.product_id = p.id
  ORDER BY pv.price ASC
  LIMIT 1
)`;

export async function findProductForCartBySlug(slug: string): Promise<ProductCartRow | null> {
  const [rows] = await pool.query<ProductCartRow[]>(
    `SELECT p.id, p.name, p.slug, p.main_image, p.is_organic, p.is_best_seller,
            ${CARD_WEIGHT_SQL} AS card_weight,
            ${CARD_PRICE_SQL} AS card_price,
            ${CARD_ORIGINAL_SQL} AS card_original_price
     FROM products p
     WHERE p.slug = ?
     LIMIT 1`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function findProductForCartById(productId: number): Promise<ProductCartRow | null> {
  const [rows] = await pool.query<ProductCartRow[]>(
    `SELECT p.id, p.name, p.slug, p.main_image, p.is_organic, p.is_best_seller,
            ${CARD_WEIGHT_SQL} AS card_weight,
            ${CARD_PRICE_SQL} AS card_price,
            ${CARD_ORIGINAL_SQL} AS card_original_price
     FROM products p
     WHERE p.id = ?
     LIMIT 1`,
    [productId]
  );
  return rows[0] ?? null;
}

export async function findCartIdByUserId(userId: number): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM carts WHERE user_id = ? LIMIT 1",
    [userId]
  );
  return rows[0]?.id != null ? Number(rows[0].id) : null;
}

export async function createCartForUser(userId: number): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO carts (user_id) VALUES (?)",
    [userId]
  );
  return result.insertId;
}

export async function getOrCreateCartId(userId: number): Promise<number> {
  const existing = await findCartIdByUserId(userId);
  if (existing) return existing;
  return createCartForUser(userId);
}

export async function listCartItems(cartId: number): Promise<CartItemRow[]> {
  const [rows] = await pool.query<CartItemRow[]>(
    `SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity,
            p.slug, p.name, p.main_image, p.is_organic, p.is_best_seller,
            ${CARD_WEIGHT_SQL} AS card_weight,
            ${CARD_PRICE_SQL} AS card_price,
            ${CARD_ORIGINAL_SQL} AS card_original_price
     FROM cart_items ci
     INNER JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ?
     ORDER BY ci.created_at ASC`,
    [cartId]
  );
  return rows;
}

export async function findCartItemById(
  lineItemId: number,
  cartId: number
): Promise<CartItemRow | null> {
  const [rows] = await pool.query<CartItemRow[]>(
    `SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity,
            p.slug, p.name, p.main_image, p.is_organic, p.is_best_seller,
            ${CARD_WEIGHT_SQL} AS card_weight,
            ${CARD_PRICE_SQL} AS card_price,
            ${CARD_ORIGINAL_SQL} AS card_original_price
     FROM cart_items ci
     INNER JOIN products p ON p.id = ci.product_id
     WHERE ci.id = ? AND ci.cart_id = ?
     LIMIT 1`,
    [lineItemId, cartId]
  );
  return rows[0] ?? null;
}

export async function findCartItemByProductId(
  cartId: number,
  productId: number
): Promise<{ id: number; quantity: number } | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1",
    [cartId, productId]
  );
  if (!rows[0]) return null;
  return { id: Number(rows[0].id), quantity: Number(rows[0].quantity) };
}

export async function insertCartItem(
  cartId: number,
  productId: number,
  quantity: number
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
    [cartId, productId, quantity]
  );
  return result.insertId;
}

export async function updateCartItemQuantity(
  lineItemId: number,
  cartId: number,
  quantity: number
): Promise<void> {
  await pool.query(
    "UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?",
    [quantity, lineItemId, cartId]
  );
}

export async function deleteCartItem(lineItemId: number, cartId: number): Promise<void> {
  await pool.query("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", [
    lineItemId,
    cartId,
  ]);
}

export async function touchCart(cartId: number): Promise<void> {
  await pool.query("UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cartId]);
}

export type CartCouponRow = {
  applied_coupon_id: number | null;
  applied_coupon_code: string | null;
  coupon_locked_until: Date | null;
};

export async function getCartCouponMeta(cartId: number): Promise<CartCouponRow | null> {
  try {
    const [rows] = await pool.query<
      (RowDataPacket & {
        applied_coupon_id: number | null;
        applied_coupon_code: string | null;
        coupon_locked_until: Date | null;
      })[]
    >(
      `SELECT applied_coupon_id, applied_coupon_code, coupon_locked_until
       FROM carts WHERE id = ? LIMIT 1`,
      [cartId]
    );
    const row = rows[0];
    if (!row) return null;
    return {
      applied_coupon_id: row.applied_coupon_id != null ? Number(row.applied_coupon_id) : null,
      applied_coupon_code: row.applied_coupon_code,
      coupon_locked_until: row.coupon_locked_until,
    };
  } catch (err) {
    if (isMissingCouponSchemaError(err)) return null;
    throw err;
  }
}

export async function setCartCoupon(
  cartId: number,
  couponId: number,
  code: string,
  lockMinutes = 15
): Promise<void> {
  await pool.query(
    `UPDATE carts SET applied_coupon_id = ?, applied_coupon_code = ?,
      coupon_locked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE)
     WHERE id = ?`,
    [couponId, code, lockMinutes, cartId]
  );
}

export async function clearCartCoupon(cartId: number): Promise<void> {
  await pool.query(
    `UPDATE carts SET applied_coupon_id = NULL, applied_coupon_code = NULL, coupon_locked_until = NULL
     WHERE id = ?`,
    [cartId]
  );
}
