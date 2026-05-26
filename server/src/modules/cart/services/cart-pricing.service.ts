import type { PricingConfig } from "../../settings/settings.types";
import { DEFAULT_PRICING_CONFIG } from "../../settings/settings.defaults";
import type { CartTotals } from "../cart.types";

export { DEFAULT_PRICING_CONFIG };

export function computeCartTotals(
  lines: { unitPrice: number; quantity: number }[],
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const deliveryFeeWaived = subtotal >= config.freeDeliveryMin;
  const deliveryFee =
    lines.length === 0 ? 0 : deliveryFeeWaived ? 0 : config.deliveryFee;
  const platformFee = lines.length > 0 ? config.platformFee : 0;
  const discount = lines.length > 0 ? config.cartPromoDiscount : 0;
  const taxable = Math.max(0, subtotal + deliveryFee + platformFee - discount);
  const tax = Math.round(taxable * config.taxRate * 100) / 100;
  const grandTotal = Math.max(0, taxable + tax);

  return {
    subtotal: roundMoney(subtotal),
    deliveryFee: deliveryFeeWaived ? config.deliveryFee : deliveryFee,
    deliveryFeeWaived,
    platformFee,
    discount,
    tax,
    grandTotal: roundMoney(grandTotal),
  };
}

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}
