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

export type CouponRules = {
  categoryIds?: number[];
  productIds?: number[];
  cities?: string[];
  postalCodes?: string[];
  buyQuantity?: number;
  getQuantity?: number;
};

export type CouponRow = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  type: CouponType;
  discount_value: string;
  max_discount: string | null;
  min_order_amount: string;
  free_delivery: number;
  usage_limit_total: number | null;
  usage_limit_per_user: number;
  times_used: number;
  new_users_only: number;
  first_order_only: number;
  is_active: number;
  starts_at: Date | null;
  ends_at: Date | null;
  rules_json: CouponRules | string | null;
  created_at: Date;
  updated_at: Date;
};

export type CartLineForCoupon = {
  productId: number;
  categoryId?: number | null;
  unitPrice: number;
  quantity: number;
};

export type CouponValidationContext = {
  userId: number | null;
  phone?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
  lines: CartLineForCoupon[];
  subtotal: number;
  city?: string | null;
  postalCode?: string | null;
};

export type AppliedCouponResult = {
  couponId: number;
  code: string;
  title: string;
  type: CouponType;
  couponDiscount: number;
  freeDelivery: boolean;
  message: string;
  amountToUnlock: number | null;
};

export type CouponOfferDto = {
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

export type CartCouponState = {
  code: string | null;
  title: string | null;
  couponDiscount: number;
  freeDeliveryFromCoupon: boolean;
};

export type AdminCouponInput = {
  code: string;
  title: string;
  description?: string | null;
  type: CouponType;
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount?: number;
  freeDelivery?: boolean;
  usageLimitTotal?: number | null;
  usageLimitPerUser?: number;
  newUsersOnly?: boolean;
  firstOrderOnly?: boolean;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  rules?: CouponRules | null;
};
