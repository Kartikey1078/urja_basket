export type CartItem = {
  /** Guest: cart line key (slug or slug::sku). Authenticated: stringified line item id */
  id: string;
  lineItemId?: number;
  productId?: number;
  slug: string;
  variantSku?: string;
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
  variantSku?: string;
};

export type DeliverySlotId = "express" | "today-evening" | "tomorrow-morning";

export type BillSummary = {
  itemTotal: number;
  deliveryFee: number;
  deliveryFeeWaived: boolean;
  couponDiscount?: number;
  tax?: number;
  toPay: number;
  /** True when totals come from backend */
  authoritative?: boolean;
};

export type AppliedCartCoupon = {
  code: string;
  title: string;
  couponDiscount: number;
  freeDelivery: boolean;
};

export type CartMode = "guest" | "authenticated";
