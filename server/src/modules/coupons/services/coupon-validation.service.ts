import { HttpError } from "../../../errors/httpError";
import type {
  AppliedCouponResult,
  CartLineForCoupon,
  CouponOfferDto,
  CouponRow,
  CouponRules,
  CouponType,
  CouponValidationContext,
} from "../coupon.types";
import * as couponRepo from "../repositories/coupon.repository";

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseRules(row: CouponRow): CouponRules | null {
  if (!row.rules_json || typeof row.rules_json === "string") {
    try {
      return row.rules_json ? (JSON.parse(row.rules_json as string) as CouponRules) : null;
    } catch {
      return null;
    }
  }
  return row.rules_json as CouponRules;
}

function eligibleSubtotal(lines: CartLineForCoupon[], rules: CouponRules | null): number {
  if (!rules?.categoryIds?.length && !rules?.productIds?.length) {
    return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  }
  return lines.reduce((s, l) => {
    if (rules.productIds?.length && !rules.productIds.includes(l.productId)) {
      return s;
    }
    if (
      rules.categoryIds?.length &&
      l.categoryId != null &&
      !rules.categoryIds.includes(l.categoryId)
    ) {
      return s;
    }
    if (
      rules.categoryIds?.length &&
      l.categoryId == null &&
      rules.productIds?.length &&
      !rules.productIds.includes(l.productId)
    ) {
      return s;
    }
    return s + l.unitPrice * l.quantity;
  }, 0);
}

function computeDiscountAmount(
  coupon: CouponRow,
  eligibleTotal: number
): { amount: number; freeDelivery: boolean } {
  const type = coupon.type as CouponType;
  const value = Number(coupon.discount_value);
  const maxCap = coupon.max_discount != null ? Number(coupon.max_discount) : null;

  if (type === "free_delivery" || coupon.free_delivery) {
    return { amount: 0, freeDelivery: true };
  }

  if (type === "percentage" || type === "flash_sale" || type === "cart_value") {
    let amount = roundMoney((eligibleTotal * value) / 100);
    if (maxCap != null) amount = Math.min(amount, maxCap);
    return { amount: Math.min(amount, eligibleTotal), freeDelivery: false };
  }

  if (type === "flat" || type === "first_order" || type === "referral" || type === "cashback") {
    const amount = Math.min(value, eligibleTotal);
    return { amount, freeDelivery: false };
  }

  if (type === "buy_x_get_y") {
    const rules = parseRules(coupon);
    const buy = rules?.buyQuantity ?? 2;
    const get = rules?.getQuantity ?? 1;
    const totalQty = eligibleTotal > 0 ? 1 : 0;
    void totalQty;
    const avgPrice = eligibleTotal > 0 ? eligibleTotal / Math.max(1, buy) : 0;
    const amount = roundMoney(avgPrice * get);
    return { amount: Math.min(amount, eligibleTotal), freeDelivery: false };
  }

  return { amount: 0, freeDelivery: false };
}

async function assertCouponBasics(
  coupon: CouponRow,
  ctx: CouponValidationContext
): Promise<void> {
  if (!coupon.is_active) {
    throw new HttpError(400, "This coupon is not active");
  }
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    throw new HttpError(400, "This coupon is not valid yet");
  }
  if (coupon.ends_at && new Date(coupon.ends_at) < now) {
    throw new HttpError(400, "This coupon has expired");
  }
  if (coupon.usage_limit_total != null && coupon.times_used >= coupon.usage_limit_total) {
    throw new HttpError(400, "This coupon has reached its usage limit");
  }

  const perUser = await couponRepo.countUserRedemptions(
    coupon.id,
    ctx.userId,
    ctx.phone ?? null
  );
  if (perUser >= coupon.usage_limit_per_user) {
    throw new HttpError(400, "You have already used this coupon");
  }

  if (coupon.first_order_only && ctx.userId != null) {
    const paid = await couponRepo.countPaidOrdersForUser(ctx.userId);
    if (paid > 0) {
      throw new HttpError(400, "This coupon is only valid on your first order");
    }
  }

  if (coupon.new_users_only && ctx.userId != null) {
    const paid = await couponRepo.countPaidOrdersForUser(ctx.userId);
    if (paid > 0) {
      throw new HttpError(400, "This offer is for new customers only");
    }
  }

  const rules = parseRules(coupon);
  if (rules?.cities?.length && ctx.city) {
    const city = ctx.city.toLowerCase();
    if (!rules.cities.some((c) => c.toLowerCase() === city)) {
      throw new HttpError(400, "This coupon is not valid in your area");
    }
  }
  if (rules?.postalCodes?.length && ctx.postalCode) {
    if (!rules.postalCodes.includes(ctx.postalCode)) {
      throw new HttpError(400, "This coupon is not valid for your pincode");
    }
  }
}

export async function validateAndApplyCoupon(
  coupon: CouponRow,
  ctx: CouponValidationContext
): Promise<AppliedCouponResult> {
  await assertCouponBasics(coupon, ctx);

  const rules = parseRules(coupon);
  const eligible = roundMoney(eligibleSubtotal(ctx.lines, rules));
  const minOrder = Number(coupon.min_order_amount);

  if (eligible < minOrder) {
    const gap = roundMoney(minOrder - eligible);
    throw new HttpError(
      400,
      `Add items worth ₹${gap} more to use ${coupon.code}`
    );
  }

  const { amount, freeDelivery } = computeDiscountAmount(coupon, eligible);

  if (amount <= 0 && !freeDelivery) {
    throw new HttpError(400, "This coupon does not apply to your cart");
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    title: coupon.title,
    type: coupon.type as CouponType,
    couponDiscount: amount,
    freeDelivery,
    message: freeDelivery
      ? "Free delivery applied"
      : `You save ₹${amount} with ${coupon.code}`,
    amountToUnlock: null,
  };
}

export async function validateCouponCode(
  code: string,
  ctx: CouponValidationContext
): Promise<AppliedCouponResult> {
  const coupon = await couponRepo.findCouponByCode(code);
  if (!coupon) {
    throw new HttpError(404, "Invalid coupon code");
  }
  return validateAndApplyCoupon(coupon, ctx);
}

export async function buildCouponOffers(
  ctx: CouponValidationContext
): Promise<CouponOfferDto[]> {
  const { couponSchemaReady } = await import("../../../lib/coupon-schema");
  if (!(await couponSchemaReady())) {
    return [];
  }

  const coupons = await couponRepo.listActiveCoupons(30);
  const offers: CouponOfferDto[] = [];

  for (const coupon of coupons) {
    const rules = parseRules(coupon);
    const eligible = roundMoney(eligibleSubtotal(ctx.lines, rules));
    const minOrder = Number(coupon.min_order_amount);
    let applicable = true;
    let reason: string | null = null;
    let amountToUnlock: number | null = null;
    let estimatedSavings = 0;

    try {
      await assertCouponBasics(coupon, ctx);
      if (eligible < minOrder) {
        applicable = false;
        amountToUnlock = roundMoney(minOrder - eligible);
        reason = `Add ₹${amountToUnlock} more`;
      } else {
        const applied = computeDiscountAmount(coupon, eligible);
        estimatedSavings = applied.amount;
        if (applied.freeDelivery) {
          estimatedSavings = Math.max(estimatedSavings, 40);
        }
      }
    } catch (e) {
      applicable = false;
      reason = e instanceof HttpError ? e.message : "Not applicable";
    }

    offers.push({
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      type: coupon.type as CouponType,
      minOrderAmount: minOrder,
      estimatedSavings,
      applicable,
      reason,
      amountToUnlock,
    });
  }

  return offers.sort((a, b) => {
    if (a.applicable !== b.applicable) return a.applicable ? -1 : 1;
    return b.estimatedSavings - a.estimatedSavings;
  });
}

export async function pickBestCoupon(
  ctx: CouponValidationContext
): Promise<AppliedCouponResult | null> {
  const offers = await buildCouponOffers(ctx);
  let best: AppliedCouponResult | null = null;

  for (const offer of offers) {
    if (!offer.applicable) continue;
    try {
      const coupon = await couponRepo.findCouponById(offer.id);
      if (!coupon) continue;
      const applied = await validateAndApplyCoupon(coupon, ctx);
      if (!best || applied.couponDiscount > best.couponDiscount) {
        best = applied;
      } else if (
        applied.couponDiscount === best.couponDiscount &&
        applied.freeDelivery &&
        !best.freeDelivery
      ) {
        best = applied;
      }
    } catch {
      /* skip */
    }
  }

  return best;
}

export async function enrichLinesWithCategories(
  lines: { productId: number; unitPrice: number; quantity: number }[]
): Promise<CartLineForCoupon[]> {
  const ids = lines.map((l) => l.productId);
  const categories = await couponRepo.getProductCategories(ids);
  return lines.map((l) => ({
    ...l,
    categoryId: categories.get(l.productId) ?? null,
  }));
}
