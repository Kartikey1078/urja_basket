import { HttpError } from "../../../errors/httpError";
import { COUPON_MIGRATE_HINT, couponSchemaReady, isMissingCouponSchemaError } from "../../../lib/coupon-schema";
import type { CartLineDto, CartResponse } from "../../cart/cart.types";
import * as cartRepo from "../../cart/repositories/cart.repository";
import { computeCartTotals, type CouponPricingInput } from "../../cart/services/cart-pricing.service";
import { getPricingConfig } from "../../settings/settings.service";
import type { CouponValidationContext } from "../coupon.types";
import * as couponRepo from "../repositories/coupon.repository";
import {
  enrichLinesWithCategories,
  validateAndApplyCoupon,
} from "./coupon-validation.service";

export async function resolveCouponForCart(
  cartId: number,
  items: CartLineDto[],
  userId: number,
  phone?: string | null
): Promise<{ pricing: CouponPricingInput | null; dto: CartResponse["coupon"] }> {
  const meta = await cartRepo.getCartCouponMeta(cartId);
  if (!meta?.applied_coupon_id || !meta.applied_coupon_code) {
    return { pricing: null, dto: null };
  }

  const coupon = await couponRepo.findCouponById(meta.applied_coupon_id);
  if (!coupon) {
    await cartRepo.clearCartCoupon(cartId);
    return { pricing: null, dto: null };
  }

  const lines = await enrichLinesWithCategories(
    items.map((i) => ({ productId: i.productId, unitPrice: i.price, quantity: i.quantity }))
  );
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const ctx: CouponValidationContext = {
    userId,
    phone: phone ?? null,
    lines,
    subtotal,
  };

  try {
    const applied = await validateAndApplyCoupon(coupon, ctx);
    return {
      pricing: {
        couponDiscount: applied.couponDiscount,
        freeDelivery: applied.freeDelivery,
      },
      dto: {
        code: applied.code,
        title: applied.title,
        couponDiscount: applied.couponDiscount,
        freeDelivery: applied.freeDelivery,
      },
    };
  } catch {
    await cartRepo.clearCartCoupon(cartId);
    return { pricing: null, dto: null };
  }
}

export async function buildCartTotalsWithCoupon(
  items: CartLineDto[],
  cartId: number,
  userId: number
): Promise<{ totals: CartResponse["totals"]; coupon: CartResponse["coupon"] }> {
  const pricingConfig = await getPricingConfig();
  const { pricing, dto } = await resolveCouponForCart(cartId, items, userId);
  const totals = computeCartTotals(
    items.map((i) => ({ unitPrice: i.price, quantity: i.quantity })),
    pricingConfig,
    pricing
  );
  return { totals, coupon: dto };
}

export async function applyCouponToCart(
  cartId: number,
  userId: number,
  code: string,
  items: CartLineDto[]
): Promise<{ totals: CartResponse["totals"]; coupon: CartResponse["coupon"] }> {
  if (!(await couponSchemaReady())) {
    throw new HttpError(503, COUPON_MIGRATE_HINT);
  }

  const lines = await enrichLinesWithCategories(
    items.map((i) => ({ productId: i.productId, unitPrice: i.price, quantity: i.quantity }))
  );
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const coupon = await couponRepo.findCouponByCode(code);
  if (!coupon) {
    throw new HttpError(404, "Invalid coupon code");
  }

  const applied = await validateAndApplyCoupon(coupon, {
    userId,
    lines,
    subtotal,
  });

  try {
    await cartRepo.setCartCoupon(cartId, applied.couponId, applied.code);
  } catch (err) {
    if (isMissingCouponSchemaError(err)) {
      throw new HttpError(503, COUPON_MIGRATE_HINT);
    }
    throw err;
  }

  const pricingConfig = await getPricingConfig();
  const totals = computeCartTotals(
    items.map((i) => ({ unitPrice: i.price, quantity: i.quantity })),
    pricingConfig,
    {
      couponDiscount: applied.couponDiscount,
      freeDelivery: applied.freeDelivery,
    }
  );

  return {
    totals,
    coupon: {
      code: applied.code,
      title: applied.title,
      couponDiscount: applied.couponDiscount,
      freeDelivery: applied.freeDelivery,
    },
  };
}
