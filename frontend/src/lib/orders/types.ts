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

export type OrderTracking = {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod: "online" | "cod";
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

export type OrderListItem = {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  fulfillmentStatus: FulfillmentStatus;
  grandTotal: number;
  deliverySlot: string | null;
  createdAt: string;
  isActive: boolean;
};

export type LastOrderRef = {
  orderId: number;
  orderNumber: string;
  phone: string;
};
