import type { Request, Response } from "express";

import { HttpError } from "../../errors/httpError";
import type { AdminCouponInput, CouponType } from "../coupons/coupon.types";
import * as couponRepo from "../coupons/repositories/coupon.repository";

const COUPON_TYPES: CouponType[] = [
  "percentage",
  "flat",
  "free_delivery",
  "first_order",
  "flash_sale",
  "referral",
  "cashback",
  "buy_x_get_y",
  "cart_value",
];

function parseId(param: string | undefined): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "Invalid id");
  }
  return id;
}

function mapCouponDto(row: Awaited<ReturnType<typeof couponRepo.findCouponById>>) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    type: row.type,
    discountValue: Number(row.discount_value),
    maxDiscount: row.max_discount != null ? Number(row.max_discount) : null,
    minOrderAmount: Number(row.min_order_amount),
    freeDelivery: Boolean(row.free_delivery),
    usageLimitTotal: row.usage_limit_total,
    usageLimitPerUser: row.usage_limit_per_user,
    timesUsed: row.times_used,
    newUsersOnly: Boolean(row.new_users_only),
    firstOrderOnly: Boolean(row.first_order_only),
    isActive: Boolean(row.is_active),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    rules: row.rules_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseBody(body: Record<string, unknown>): AdminCouponInput {
  const type = body.type as CouponType;
  if (!type || !COUPON_TYPES.includes(type)) {
    throw new HttpError(400, `type required: ${COUPON_TYPES.join(", ")}`);
  }
  const code = typeof body.code === "string" ? body.code : "";
  const title = typeof body.title === "string" ? body.title : "";
  if (!code.trim() || !title.trim()) {
    throw new HttpError(400, "code and title are required");
  }
  return {
    code,
    title,
    description: typeof body.description === "string" ? body.description : null,
    type,
    discountValue: Number(body.discountValue ?? 0),
    maxDiscount: body.maxDiscount != null ? Number(body.maxDiscount) : null,
    minOrderAmount: Number(body.minOrderAmount ?? 0),
    freeDelivery: Boolean(body.freeDelivery),
    usageLimitTotal: body.usageLimitTotal != null ? Number(body.usageLimitTotal) : null,
    usageLimitPerUser: Number(body.usageLimitPerUser ?? 1),
    newUsersOnly: Boolean(body.newUsersOnly),
    firstOrderOnly: Boolean(body.firstOrderOnly),
    isActive: body.isActive !== false,
    startsAt: typeof body.startsAt === "string" ? body.startsAt : null,
    endsAt: typeof body.endsAt === "string" ? body.endsAt : null,
    rules:
      body.rules && typeof body.rules === "object"
        ? (body.rules as AdminCouponInput["rules"])
        : null,
  };
}

export async function adminListCoupons(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const active =
    req.query.active === "1" ? true : req.query.active === "0" ? false : undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const result = await couponRepo.listCouponsAdmin({ q, type, active, page, limit });
  res.json({
    data: result.items.map((row) => mapCouponDto(row)!),
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
    },
  });
}

export async function adminGetCoupon(req: Request, res: Response) {
  const id = parseId(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const row = await couponRepo.findCouponById(id);
  if (!row) throw new HttpError(404, "Coupon not found");
  res.json({ data: mapCouponDto(row) });
}

export async function adminCreateCoupon(req: Request, res: Response) {
  const input = parseBody(req.body as Record<string, unknown>);
  const existing = await couponRepo.findCouponByCode(input.code);
  if (existing) {
    throw new HttpError(409, "Coupon code already exists");
  }
  const id = await couponRepo.insertCoupon(input);
  const row = await couponRepo.findCouponById(id);
  res.status(201).json({ data: mapCouponDto(row) });
}

export async function adminUpdateCoupon(req: Request, res: Response) {
  const id = parseId(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const row = await couponRepo.findCouponById(id);
  if (!row) throw new HttpError(404, "Coupon not found");

  const body = req.body as Record<string, unknown>;
  const patch: Partial<AdminCouponInput> = {};
  if (body.code !== undefined) patch.code = String(body.code);
  if (body.title !== undefined) patch.title = String(body.title);
  if (body.description !== undefined) patch.description = body.description as string | null;
  if (body.type !== undefined) patch.type = body.type as CouponType;
  if (body.discountValue !== undefined) patch.discountValue = Number(body.discountValue);
  if (body.maxDiscount !== undefined) patch.maxDiscount = Number(body.maxDiscount);
  if (body.minOrderAmount !== undefined) patch.minOrderAmount = Number(body.minOrderAmount);
  if (body.freeDelivery !== undefined) patch.freeDelivery = Boolean(body.freeDelivery);
  if (body.usageLimitTotal !== undefined) patch.usageLimitTotal = Number(body.usageLimitTotal);
  if (body.usageLimitPerUser !== undefined) patch.usageLimitPerUser = Number(body.usageLimitPerUser);
  if (body.newUsersOnly !== undefined) patch.newUsersOnly = Boolean(body.newUsersOnly);
  if (body.firstOrderOnly !== undefined) patch.firstOrderOnly = Boolean(body.firstOrderOnly);
  if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive);
  if (body.startsAt !== undefined) patch.startsAt = body.startsAt as string | null;
  if (body.endsAt !== undefined) patch.endsAt = body.endsAt as string | null;
  if (body.rules !== undefined) patch.rules = body.rules as AdminCouponInput["rules"];

  await couponRepo.updateCoupon(id, patch);
  const updated = await couponRepo.findCouponById(id);
  res.json({ data: mapCouponDto(updated) });
}

export async function adminDeleteCoupon(req: Request, res: Response) {
  const id = parseId(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  await couponRepo.deleteCoupon(id);
  res.status(204).send();
}

export async function adminCouponAnalytics(_req: Request, res: Response) {
  const data = await couponRepo.getCouponAnalytics();
  res.json({ data });
}

export async function adminCouponAbuseLogs(req: Request, res: Response) {
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const rows = await couponRepo.listAbuseLogsAdmin(limit);
  res.json({ data: rows });
}
