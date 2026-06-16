import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";

import { HttpError } from "../../../errors/httpError";
import { COUPON_MIGRATE_HINT, couponSchemaReady } from "../../../lib/coupon-schema";
import { findUserByClerkId } from "../../users/repositories/user.repository";
import * as cartRepo from "../../cart/repositories/cart.repository";
import * as cartService from "../../cart/services/cart.service";
import { applyCouponToCart } from "../services/coupon-cart.service";
import { checkCouponRateLimit, rateLimitKey } from "../services/coupon-rate-limit";
import * as couponRepo from "../repositories/coupon.repository";
import {
  buildCouponOffers,
  enrichLinesWithCategories,
  pickBestCoupon,
  validateCouponCode,
} from "../services/coupon-validation.service";
import type { CouponValidationContext } from "../coupon.types";

type PreviewItem = { productSlug: string; quantity: number };

async function linesFromPreviewItems(items: PreviewItem[]) {
  const lines: { productId: number; unitPrice: number; quantity: number }[] = [];
  for (const item of items) {
    const product = await cartRepo.findProductForCartBySlug(item.productSlug);
    if (!product) continue;
    const price = Number(product.card_price ?? 0);
    lines.push({
      productId: product.id,
      unitPrice: price,
      quantity: Math.min(99, Math.max(1, Math.floor(item.quantity))),
    });
  }
  if (lines.length === 0) {
    throw new HttpError(400, "No valid products in cart");
  }
  return enrichLinesWithCategories(lines);
}

async function requireCouponSchema(): Promise<void> {
  if (!(await couponSchemaReady())) {
    throw new HttpError(503, COUPON_MIGRATE_HINT);
  }
}

async function resolveUserFromReq(req: Request): Promise<number | null> {
  const clerkId = getAuth(req).userId;
  if (!clerkId) return null;
  const user = await findUserByClerkId(clerkId);
  return user?.id ?? null;
}

function clientMeta(req: Request) {
  return {
    ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip,
    userAgent: req.headers["user-agent"] ?? null,
    deviceFingerprint: (req.headers["x-device-id"] as string) ?? null,
  };
}

export async function listOffers(req: Request, res: Response) {
  const body = (req.body ?? {}) as { items?: PreviewItem[] };
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    res.json({ data: [], schemaReady: await couponSchemaReady() });
    return;
  }

  if (!(await couponSchemaReady())) {
    res.json({ data: [], schemaReady: false, message: COUPON_MIGRATE_HINT });
    return;
  }

  const userId = await resolveUserFromReq(req);
  const lines = await linesFromPreviewItems(items);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const ctx: CouponValidationContext = { userId, lines, subtotal };
  const offers = await buildCouponOffers(ctx);
  res.json({ data: offers, schemaReady: true });
}

export async function previewCoupon(req: Request, res: Response) {
  await requireCouponSchema();
  const { ip, userAgent, deviceFingerprint } = clientMeta(req);
  const userId = await resolveUserFromReq(req);
  const key = rateLimitKey(ip, userId);
  if (!checkCouponRateLimit(key)) {
    await couponRepo.insertAbuseLog({
      userId,
      reason: "rate_limit",
      detail: "Coupon preview rate limit",
      ip,
      userAgent,
    });
    throw new HttpError(429, "Too many coupon attempts. Try again shortly.");
  }

  const body = req.body as { code?: string; items?: PreviewItem[] };
  const code = body.code?.trim();
  if (!code) {
    throw new HttpError(400, "Coupon code is required");
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    throw new HttpError(400, "Cart items required to validate coupon");
  }

  const lines = await linesFromPreviewItems(items);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const applied = await validateCouponCode(code, {
    userId,
    lines,
    subtotal,
    ip,
    userAgent,
    deviceFingerprint: deviceFingerprint ?? null,
  });

  res.json({ data: applied });
}

export async function applyCoupon(req: Request, res: Response) {
  await requireCouponSchema();
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    throw new HttpError(401, "Sign in to apply coupons");
  }
  const user = await findUserByClerkId(clerkId);
  if (!user) {
    throw new HttpError(401, "User profile not found");
  }

  const { ip, userAgent } = clientMeta(req);
  const key = rateLimitKey(ip, user.id);
  if (!checkCouponRateLimit(key)) {
    await couponRepo.insertAbuseLog({
      userId: user.id,
      reason: "rate_limit",
      detail: "Coupon apply rate limit",
      ip,
      userAgent,
    });
    throw new HttpError(429, "Too many coupon attempts. Try again shortly.");
  }

  const code = (req.body as { code?: string }).code?.trim();
  if (!code) {
    throw new HttpError(400, "Coupon code is required");
  }

  const cart = await cartService.getCartForUser(clerkId);
  if (cart.items.length === 0) {
    throw new HttpError(400, "Cart is empty");
  }

  const cartId = cart.cartId;
  const { totals, coupon } = await applyCouponToCart(cartId, user.id, code, cart.items);
  res.json({
    data: {
      cartId,
      items: cart.items,
      totals,
      coupon,
    },
  });
}

export async function removeCoupon(req: Request, res: Response) {
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    throw new HttpError(401, "Unauthorized");
  }
  const cart = await cartService.removeCartCoupon(clerkId);
  res.json({ data: cart });
}

export async function applyBestCoupon(req: Request, res: Response) {
  await requireCouponSchema();
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    throw new HttpError(401, "Sign in to apply coupons");
  }
  const user = await findUserByClerkId(clerkId);
  if (!user) {
    throw new HttpError(401, "User profile not found");
  }

  const cart = await cartService.getCartForUser(clerkId);
  if (cart.items.length === 0) {
    throw new HttpError(400, "Cart is empty");
  }

  const lines = await enrichLinesWithCategories(
    cart.items.map((i) => ({
      productId: i.productId,
      unitPrice: i.price,
      quantity: i.quantity,
    }))
  );
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const best = await pickBestCoupon({ userId: user.id, lines, subtotal });
  if (!best) {
    throw new HttpError(404, "No applicable coupons for your cart");
  }

  const { totals, coupon } = await applyCouponToCart(cart.cartId, user.id, best.code, cart.items);
  res.json({
    data: {
      cartId: cart.cartId,
      items: cart.items,
      totals,
      coupon,
      applied: best,
    },
  });
}
