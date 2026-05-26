export type CartItem = {
  /** Guest: product slug. Authenticated: stringified line item id */
  id: string;
  lineItemId?: number;
  productId?: number;
  slug: string;
  name: string;
  subtitle: string;
  tag?: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
};

export type CartProductInput = {
  slug: string;
  name: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  tag?: string;
  productId?: number;
};

export type DeliverySlotId = "express" | "today-evening" | "tomorrow-morning";

export type BillSummary = {
  itemTotal: number;
  deliveryFee: number;
  deliveryFeeWaived: boolean;
  packagingCharges: number;
  discount: number;
  tax?: number;
  toPay: number;
  /** True when totals come from backend */
  authoritative?: boolean;
};

export type CartMode = "guest" | "authenticated";
