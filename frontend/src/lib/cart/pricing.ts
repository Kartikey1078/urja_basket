import {
  CART_PROMO_DISCOUNT,
  DELIVERY_FEE,
  FREE_DELIVERY_MIN,
  PACKAGING_CHARGES,
} from "./constants";
import type { BillSummary, CartItem } from "./types";

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function discountPercent(price: number, mrp: number) {
  if (mrp <= 0 || mrp <= price) return 0;
  return Math.round((1 - price / mrp) * 100);
}

export function computeBillSummary(items: CartItem[]): BillSummary {
  const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFeeWaived = itemTotal >= FREE_DELIVERY_MIN;
  const deliveryFee = deliveryFeeWaived ? 0 : DELIVERY_FEE;
  const discount = items.length > 0 ? CART_PROMO_DISCOUNT : 0;
  const toPay = Math.max(
    0,
    itemTotal + deliveryFee + PACKAGING_CHARGES - discount
  );

  return {
    itemTotal,
    deliveryFee: deliveryFeeWaived ? DELIVERY_FEE : deliveryFee,
    deliveryFeeWaived,
    packagingCharges: items.length > 0 ? PACKAGING_CHARGES : 0,
    discount,
    tax: 0,
    toPay,
  };
}

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function productToCartItem(
  product: {
    slug: string;
    name: string;
    weight: string;
    price: number;
    mrp: number;
    image: string;
    tag?: string;
  },
  quantity = 1
): CartItem {
  return {
    id: product.slug,
    slug: product.slug,
    name: product.name,
    subtitle: product.weight,
    tag: product.tag,
    price: product.price,
    mrp: product.mrp,
    image: product.image,
    quantity,
  };
}
