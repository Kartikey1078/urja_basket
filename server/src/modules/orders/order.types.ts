import type { CartLineDto, CartTotals } from "../cart/cart.types";

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "paid"
  | "failed"
  | "cancelled";
export type PaymentMethod = "online" | "cod";
export type PaymentStatus = "created" | "paid" | "failed" | "pending_collection";

export type FulfillmentStatus =
  | "order_placed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type TrackingStepState = "done" | "active" | "pending";

export type OrderTrackingStep = {
  id: FulfillmentStatus;
  title: string;
  subtitle: string;
  state: TrackingStepState;
  at: string | null;
};

export type OrderTrackingDto = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  fulfillmentStatus: FulfillmentStatus;
  deliverySlot: string | null;
  grandTotal: number;
  amountPaise: number;
  customerName: string;
  addressPreview: string;
  city: string;
  itemCount: number;
  itemsPreview: { name: string; quantity: number; image: string | null }[];
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  etaMinutes: number | null;
  isActive: boolean;
  codAmountDue: number | null;
  steps: OrderTrackingStep[];
  partner: { name: string; phone: string } | null;
};

export type AddressSnapshot = {
  addressId?: number | null;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  formatted: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  addressType?: string;
};

export type CheckoutItemInput = {
  productSlug: string;
  quantity: number;
};

export type CreateCheckoutInput = {
  amountPaise?: number;
  deliverySlot?: string | null;
  address: AddressSnapshot;
  items?: CheckoutItemInput[];
  paymentMethod?: PaymentMethod;
};

export type OrderRow = {
  id: number;
  order_number: string;
  user_id: number | null;
  address_id: number | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  delivery_slot: string | null;
  currency: string;
  subtotal: string;
  delivery_fee: string;
  delivery_fee_waived: number;
  platform_fee: string;
  discount: string;
  tax: string;
  grand_total: string;
  amount_paise: number;
  customer_name: string;
  customer_phone: string;
  address_snapshot: AddressSnapshot;
  razorpay_order_id: string | null;
  razorpay_receipt: string | null;
  paid_at: Date | null;
  fulfillment_status: FulfillmentStatus;
  estimated_delivery_at: Date | null;
  delivered_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_slug: string;
  product_name: string;
  product_subtitle: string | null;
  product_image: string | null;
  unit_price: string;
  mrp: string;
  quantity: number;
  line_total: string;
};

export type PaymentRow = {
  id: number;
  order_id: number;
  provider: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  paid_at: Date | null;
};

export type CheckoutLine = CartLineDto;

export type CheckoutSnapshot = {
  items: CheckoutLine[];
  totals: CartTotals;
};

export type PlacedOrderDto = {
  dbOrderId: number;
  orderNumber: string;
  status: OrderStatus;
  grandTotal: number;
  amountPaise: number;
};

export type RazorpayCheckoutResult = {
  razorpayOrderId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  keyId: string;
  receipt: string;
  order: PlacedOrderDto;
};

export type PaymentVerifiedDto = {
  verified: boolean;
  dbOrderId: number;
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: OrderStatus;
};

export type CodPlacedOrderDto = {
  paymentMethod: "cod";
  dbOrderId: number;
  orderNumber: string;
  status: OrderStatus;
  grandTotal: number;
  amountPaise: number;
  message: string;
};

export type CheckoutPlaceResult = RazorpayCheckoutResult | CodPlacedOrderDto;
