import type { PricingConfig } from "../../settings/settings.types";
import { DEFAULT_PRICING_CONFIG } from "../../settings/settings.defaults";
import type { CartTotals } from "../cart.types";

export { DEFAULT_PRICING_CONFIG };

export type CouponPricingInput = {
  couponDiscount: number;
  freeDelivery: boolean;
};

export function computeCartTotals(
  lines: { unitPrice: number; quantity: number }[],
  config: PricingConfig = DEFAULT_PRICING_CONFIG,
  coupon?: CouponPricingInput | null
): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const sitePromoDiscount = lines.length > 0 ? config.cartPromoDiscount : 0;
  const couponDiscount = coupon?.couponDiscount ?? 0;
  const freeDeliveryFromCoupon = Boolean(coupon?.freeDelivery);
  const deliveryFeeWaived =
    lines.length === 0
      ? false
      : subtotal >= config.freeDeliveryMin || freeDeliveryFromCoupon;
  const deliveryFee = lines.length === 0 ? 0 : deliveryFeeWaived ? 0 : config.deliveryFee;
  const platformFee = lines.length > 0 ? config.platformFee : 0;

  const maxDiscount = Math.max(0, subtotal + platformFee - 0.01);
  const rawDiscount = sitePromoDiscount + couponDiscount;
  const discount = Math.min(rawDiscount, maxDiscount);

  const taxable = Math.max(
    0,
    subtotal + (deliveryFeeWaived ? 0 : deliveryFee) + platformFee - discount
  );
  const tax = Math.round(taxable * config.taxRate * 100) / 100;
  const grandTotal = Math.max(0, roundMoney(taxable + tax));

  return {
    subtotal: roundMoney(subtotal),
    deliveryFee: deliveryFeeWaived ? config.deliveryFee : deliveryFee,
    deliveryFeeWaived,
    platformFee,
    sitePromoDiscount: roundMoney(sitePromoDiscount),
    couponDiscount: roundMoney(couponDiscount),
    discount: roundMoney(discount),
    tax,
    grandTotal,
  };
}

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}
