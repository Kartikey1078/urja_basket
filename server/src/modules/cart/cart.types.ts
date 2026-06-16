export type CartCouponDto = {
  code: string;
  title: string;
  couponDiscount: number;
  freeDelivery: boolean;
};

export type CartTotals = {
  subtotal: number;
  deliveryFee: number;
  deliveryFeeWaived: boolean;
  platformFee: number;
  sitePromoDiscount: number;
  couponDiscount: number;
  discount: number;
  tax: number;
  grandTotal: number;
};

export type CartLineDto = {
  lineItemId: number;
  productId: number;
  slug: string;
  name: string;
  subtitle: string;
  tag: string | null;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  lineTotal: number;
};

export type CartResponse = {
  cartId: number;
  items: CartLineDto[];
  totals: CartTotals;
  coupon: CartCouponDto | null;
};

export type GuestSyncItem = {
  productSlug: string;
  quantity: number;
};
