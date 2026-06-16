import type { RowDataPacket, ResultSetHeader } from "mysql2";

import { pool } from "../../../database/pool";
import type { AdminCouponInput, CouponRow, CouponRules } from "../coupon.types";

type CouponPacket = CouponRow & RowDataPacket;

function parseRules(raw: CouponRow["rules_json"]): CouponRules | null {
  if (raw == null) return null;
  if (typeof raw === "object") return raw as CouponRules;
  try {
    return JSON.parse(raw as string) as CouponRules;
  } catch {
    return null;
  }
}

export function mapCouponRow(row: CouponPacket): CouponRow {
  return { ...row, rules_json: parseRules(row.rules_json) };
}

export async function findCouponByCode(code: string): Promise<CouponRow | null> {
  const [rows] = await pool.query<CouponPacket[]>(
    `SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) LIMIT 1`,
    [code.trim()]
  );
  const row = rows[0];
  return row ? mapCouponRow(row) : null;
}

export async function findCouponById(id: number): Promise<CouponRow | null> {
  const [rows] = await pool.query<CouponPacket[]>(`SELECT * FROM coupons WHERE id = ? LIMIT 1`, [
    id,
  ]);
  const row = rows[0];
  return row ? mapCouponRow(row) : null;
}

export async function listActiveCoupons(limit = 50): Promise<CouponRow[]> {
  const [rows] = await pool.query<CouponPacket[]>(
    `SELECT * FROM coupons
     WHERE is_active = 1
       AND (starts_at IS NULL OR starts_at <= NOW())
       AND (ends_at IS NULL OR ends_at >= NOW())
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows.map(mapCouponRow);
}

export async function listCouponsAdmin(options?: {
  q?: string;
  type?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ items: CouponRow[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(100, Math.max(1, options?.limit ?? 20));
  const offset = (page - 1) * limit;
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (options?.q?.trim()) {
    clauses.push("(code LIKE ? OR title LIKE ?)");
    const term = `%${options.q.trim()}%`;
    params.push(term, term);
  }
  if (options?.type) {
    clauses.push("type = ?");
    params.push(options.type);
  }
  if (options?.active === true) {
    clauses.push("is_active = 1");
  } else if (options?.active === false) {
    clauses.push("is_active = 0");
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const [countRows] = await pool.query<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total FROM coupons ${where}`,
    params
  );
  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await pool.query<CouponPacket[]>(
    `SELECT * FROM coupons ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { items: rows.map(mapCouponRow), total, page, limit };
}

export async function insertCoupon(input: AdminCouponInput): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO coupons (
      code, title, description, type, discount_value, max_discount, min_order_amount,
      free_delivery, usage_limit_total, usage_limit_per_user, new_users_only, first_order_only,
      is_active, starts_at, ends_at, rules_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.code.trim().toUpperCase(),
      input.title.trim(),
      input.description?.trim() ?? null,
      input.type,
      input.discountValue,
      input.maxDiscount ?? null,
      input.minOrderAmount ?? 0,
      input.freeDelivery ? 1 : 0,
      input.usageLimitTotal ?? null,
      input.usageLimitPerUser ?? 1,
      input.newUsersOnly ? 1 : 0,
      input.firstOrderOnly ? 1 : 0,
      input.isActive !== false ? 1 : 0,
      input.startsAt ?? null,
      input.endsAt ?? null,
      input.rules ? JSON.stringify(input.rules) : null,
    ]
  );
  return result.insertId;
}

export async function updateCoupon(id: number, patch: Partial<AdminCouponInput>): Promise<void> {
  const sets: string[] = [];
  const params: (string | number | null)[] = [];

  if (patch.code !== undefined) {
    sets.push("code = ?");
    params.push(patch.code.trim().toUpperCase());
  }
  if (patch.title !== undefined) {
    sets.push("title = ?");
    params.push(patch.title.trim());
  }
  if (patch.description !== undefined) {
    sets.push("description = ?");
    params.push(patch.description);
  }
  if (patch.type !== undefined) {
    sets.push("type = ?");
    params.push(patch.type);
  }
  if (patch.discountValue !== undefined) {
    sets.push("discount_value = ?");
    params.push(patch.discountValue);
  }
  if (patch.maxDiscount !== undefined) {
    sets.push("max_discount = ?");
    params.push(patch.maxDiscount);
  }
  if (patch.minOrderAmount !== undefined) {
    sets.push("min_order_amount = ?");
    params.push(patch.minOrderAmount);
  }
  if (patch.freeDelivery !== undefined) {
    sets.push("free_delivery = ?");
    params.push(patch.freeDelivery ? 1 : 0);
  }
  if (patch.usageLimitTotal !== undefined) {
    sets.push("usage_limit_total = ?");
    params.push(patch.usageLimitTotal);
  }
  if (patch.usageLimitPerUser !== undefined) {
    sets.push("usage_limit_per_user = ?");
    params.push(patch.usageLimitPerUser);
  }
  if (patch.newUsersOnly !== undefined) {
    sets.push("new_users_only = ?");
    params.push(patch.newUsersOnly ? 1 : 0);
  }
  if (patch.firstOrderOnly !== undefined) {
    sets.push("first_order_only = ?");
    params.push(patch.firstOrderOnly ? 1 : 0);
  }
  if (patch.isActive !== undefined) {
    sets.push("is_active = ?");
    params.push(patch.isActive ? 1 : 0);
  }
  if (patch.startsAt !== undefined) {
    sets.push("starts_at = ?");
    params.push(patch.startsAt);
  }
  if (patch.endsAt !== undefined) {
    sets.push("ends_at = ?");
    params.push(patch.endsAt);
  }
  if (patch.rules !== undefined) {
    sets.push("rules_json = ?");
    params.push(patch.rules ? JSON.stringify(patch.rules) : null);
  }

  if (sets.length === 0) return;
  params.push(id);
  await pool.query(`UPDATE coupons SET ${sets.join(", ")} WHERE id = ?`, params);
}

export async function deleteCoupon(id: number): Promise<void> {
  await pool.query(`DELETE FROM coupons WHERE id = ?`, [id]);
}

export async function countUserRedemptions(
  couponId: number,
  userId: number | null,
  phone?: string | null
): Promise<number> {
  if (userId != null) {
    const [rows] = await pool.query<(RowDataPacket & { c: number })[]>(
      `SELECT COUNT(*) AS c FROM coupon_redemptions
       WHERE coupon_id = ? AND user_id = ? AND status IN ('pending', 'confirmed')`,
      [couponId, userId]
    );
    return Number(rows[0]?.c ?? 0);
  }
  if (phone) {
    const [rows] = await pool.query<(RowDataPacket & { c: number })[]>(
      `SELECT COUNT(*) AS c FROM coupon_redemptions
       WHERE coupon_id = ? AND customer_phone = ? AND status IN ('pending', 'confirmed')`,
      [couponId, phone]
    );
    return Number(rows[0]?.c ?? 0);
  }
  return 0;
}

export async function countPaidOrdersForUser(userId: number): Promise<number> {
  const [rows] = await pool.query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) AS c FROM orders
     WHERE user_id = ? AND status IN ('paid', 'confirmed')`,
    [userId]
  );
  return Number(rows[0]?.c ?? 0);
}

export async function getProductCategories(
  productIds: number[]
): Promise<Map<number, number | null>> {
  if (productIds.length === 0) return new Map();
  const placeholders = productIds.map(() => "?").join(",");
  const [rows] = await pool.query<(RowDataPacket & { id: number; category_id: number | null })[]>(
    `SELECT id, category_id FROM products WHERE id IN (${placeholders})`,
    productIds
  );
  const map = new Map<number, number | null>();
  for (const r of rows) {
    map.set(r.id, r.category_id);
  }
  return map;
}

export async function insertAbuseLog(input: {
  userId?: number | null;
  couponId?: number | null;
  code?: string | null;
  reason: string;
  detail?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  await pool.query(
    `INSERT INTO coupon_abuse_logs (user_id, coupon_id, code, reason, detail, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.userId ?? null,
      input.couponId ?? null,
      input.code ?? null,
      input.reason,
      input.detail ?? null,
      input.ip ?? null,
      input.userAgent ?? null,
    ]
  );
}

export async function insertRedemption(input: {
  couponId: number;
  orderId: number;
  userId: number | null;
  discountAmount: number;
  phone?: string | null;
  deviceFingerprint?: string | null;
  ip?: string | null;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO coupon_redemptions (
      coupon_id, order_id, user_id, discount_amount, customer_phone,
      device_fingerprint, ip_address, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      input.couponId,
      input.orderId,
      input.userId,
      input.discountAmount,
      input.phone ?? null,
      input.deviceFingerprint ?? null,
      input.ip ?? null,
    ]
  );
  await pool.query(`UPDATE coupons SET times_used = times_used + 1 WHERE id = ?`, [
    input.couponId,
  ]);
  return result.insertId;
}

export async function confirmRedemption(orderId: number): Promise<void> {
  await pool.query(
    `UPDATE coupon_redemptions SET status = 'confirmed' WHERE order_id = ? AND status = 'pending'`,
    [orderId]
  );
}

export async function rollbackRedemption(orderId: number): Promise<void> {
  const [rows] = await pool.query<(RowDataPacket & { coupon_id: number })[]>(
    `SELECT coupon_id FROM coupon_redemptions WHERE order_id = ? AND status = 'pending'`,
    [orderId]
  );
  if (rows.length === 0) return;
  await pool.query(
    `UPDATE coupon_redemptions SET status = 'rolled_back' WHERE order_id = ? AND status = 'pending'`,
    [orderId]
  );
  for (const r of rows) {
    await pool.query(
      `UPDATE coupons SET times_used = GREATEST(0, times_used - 1) WHERE id = ?`,
      [r.coupon_id]
    );
  }
}

export async function listAbuseLogsAdmin(limit = 50): Promise<
  (RowDataPacket & {
    id: number;
    user_id: number | null;
    coupon_id: number | null;
    code: string | null;
    reason: string;
    detail: string | null;
    ip_address: string | null;
    created_at: Date;
  })[]
> {
  const [rows] = await pool.query(
    `SELECT id, user_id, coupon_id, code, reason, detail, ip_address, created_at
     FROM coupon_abuse_logs ORDER BY created_at DESC LIMIT ?`,
    [Math.min(200, limit)]
  );
  return rows as never;
}

export async function getCouponAnalytics(): Promise<{
  activeCoupons: number;
  totalRedemptions: number;
  confirmedDiscount: string;
  abuseLast24h: number;
}> {
  const [[active]] = await pool.query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) AS c FROM coupons WHERE is_active = 1`
  );
  const [[redemptions]] = await pool.query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) AS c FROM coupon_redemptions WHERE status = 'confirmed'`
  );
  const [[discount]] = await pool.query<(RowDataPacket & { s: string })[]>(
    `SELECT COALESCE(SUM(discount_amount), 0) AS s FROM coupon_redemptions WHERE status = 'confirmed'`
  );
  const [[abuse]] = await pool.query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) AS c FROM coupon_abuse_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
  );
  return {
    activeCoupons: Number(active?.c ?? 0),
    totalRedemptions: Number(redemptions?.c ?? 0),
    confirmedDiscount: String(discount?.s ?? 0),
    abuseLast24h: Number(abuse?.c ?? 0),
  };
}
