export type CouponType =
  | "percentage"
  | "flat"
  | "free_delivery"
  | "first_order"
  | "flash_sale"
  | "referral"
  | "cashback"
  | "buy_x_get_y"
  | "cart_value";

export type CouponOffer = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  type: CouponType;
  minOrderAmount: number;
  estimatedSavings: number;
  applicable: boolean;
  reason: string | null;
  amountToUnlock: number | null;
};

export type AppliedCouponPreview = {
  couponId: number;
  code: string;
  title: string;
  type: CouponType;
  couponDiscount: number;
  freeDelivery: boolean;
  message: string;
  amountToUnlock: number | null;
};

export type CartCouponDto = {
  code: string;
  title: string;
  couponDiscount: number;
  freeDelivery: boolean;
};
