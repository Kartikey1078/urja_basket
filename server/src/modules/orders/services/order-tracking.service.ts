import { HttpError } from "../../../errors/httpError";
import type {
  FulfillmentStatus,
  OrderRow,
  OrderTrackingDto,
  OrderTrackingStep,
  TrackingStepState,
} from "../order.types";
import * as orderRepo from "../repositories/order.repository";

const STEP_ORDER: FulfillmentStatus[] = [
  "order_placed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

const SLOT_ETA_MINUTES: Record<string, number> = {
  express: 18,
  "today-evening": 150,
  "tomorrow-morning": 18 * 60 + 480,
};

const STEP_META: Record<
  FulfillmentStatus,
  { title: string; subtitle: string }
> = {
  order_placed: {
    title: "Order placed",
    subtitle: "We've received your order",
  },
  preparing: {
    title: "Getting packed",
    subtitle: "Store is preparing your items",
  },
  out_for_delivery: {
    title: "On the way",
    subtitle: "Delivery partner is heading to you",
  },
  delivered: {
    title: "Delivered",
    subtitle: "Enjoy your order!",
  },
  cancelled: {
    title: "Cancelled",
    subtitle: "This order was cancelled",
  },
};

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  return na.length >= 10 && na === nb;
}

export function estimateDeliveryAt(deliverySlot: string | null, from = new Date()): Date {
  const minutes = SLOT_ETA_MINUTES[deliverySlot ?? "express"] ?? 18;
  return new Date(from.getTime() + minutes * 60 * 1000);
}

function isTrackableOrder(order: OrderRow): boolean {
  if (order.status === "failed" || order.status === "cancelled") return false;
  if (order.status === "pending_payment") return false;
  return true;
}

function stepState(
  stepId: FulfillmentStatus,
  current: FulfillmentStatus
): TrackingStepState {
  if (current === "cancelled") {
    return stepId === "order_placed" ? "done" : "pending";
  }
  const curIdx = STEP_ORDER.indexOf(current);
  const stepIdx = STEP_ORDER.indexOf(stepId);
  if (stepIdx < 0) return "pending";
  if (stepIdx < curIdx) return "done";
  if (stepIdx === curIdx) return "active";
  return "pending";
}

function buildSteps(
  current: FulfillmentStatus,
  createdAt: Date,
  deliveredAt: Date | null
): OrderTrackingStep[] {
  const steps = STEP_ORDER.map((id) => {
    const state = stepState(id, current);
    let at: string | null = null;
    if (state === "done" || state === "active") {
      if (id === "delivered" && deliveredAt) {
        at = deliveredAt.toISOString();
      } else if (id === "order_placed") {
        at = createdAt.toISOString();
      } else {
        const offset =
          id === "preparing" ? 2 : id === "out_for_delivery" ? 6 : id === "delivered" ? 18 : 0;
        at = new Date(createdAt.getTime() + offset * 60_000).toISOString();
      }
    }
    return {
      id,
      title: STEP_META[id].title,
      subtitle: STEP_META[id].subtitle,
      state,
      at,
    };
  });
  return steps;
}

function etaMinutesRemaining(order: OrderRow): number | null {
  if (order.fulfillment_status === "delivered" || order.fulfillment_status === "cancelled") {
    return null;
  }
  const target = order.estimated_delivery_at
    ? new Date(order.estimated_delivery_at).getTime()
    : estimateDeliveryAt(order.delivery_slot, new Date(order.created_at)).getTime();
  const diff = Math.ceil((target - Date.now()) / 60_000);
  return Math.max(1, diff);
}

function mockPartner(order: OrderRow): OrderTrackingDto["partner"] {
  if (
    order.fulfillment_status !== "out_for_delivery" &&
    order.fulfillment_status !== "delivered"
  ) {
    return null;
  }
  const seed = order.id % 3;
  const names = ["Rahul Kumar", "Amit Sharma", "Vikram Singh"];
  return {
    name: names[seed] ?? names[0],
    phone: "98XXX-XX" + String(100 + (order.id % 900)).slice(-3),
  };
}

export async function getOrderTracking(
  orderId: number,
  access: { userId?: number | null; phone?: string | null }
): Promise<OrderTrackingDto> {
  let order = await orderRepo.findOrderById(orderId);
  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  const ownsOrder =
    access.userId != null && order.user_id != null && order.user_id === access.userId;
  const phoneOk =
    access.phone != null && phonesMatch(access.phone, order.customer_phone);

  if (!ownsOrder && !phoneOk) {
    throw new HttpError(403, "Not allowed to view this order");
  }

  if (!isTrackableOrder(order)) {
    throw new HttpError(400, "Order is not available for tracking yet");
  }

  const items = await orderRepo.listOrderItems(orderId);
  const current = order.fulfillment_status;
  const isActive = current !== "delivered" && current !== "cancelled";

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentMethod: order.payment_method ?? "online",
    fulfillmentStatus: current,
    deliverySlot: order.delivery_slot,
    grandTotal: Number(order.grand_total),
    amountPaise: order.amount_paise,
    customerName: order.customer_name,
    addressPreview: order.address_snapshot.formatted,
    city: order.address_snapshot.city,
    itemCount: items.length,
    itemsPreview: items.slice(0, 4).map((i) => ({
      name: i.product_name,
      quantity: i.quantity,
      image: i.product_image,
    })),
    estimatedDeliveryAt: order.estimated_delivery_at
      ? new Date(order.estimated_delivery_at).toISOString()
      : null,
    deliveredAt: order.delivered_at
      ? new Date(order.delivered_at).toISOString()
      : null,
    createdAt: new Date(order.created_at).toISOString(),
    etaMinutes: etaMinutesRemaining(order),
    isActive,
    codAmountDue:
      order.payment_method === "cod" && order.status !== "paid"
        ? Number(order.grand_total)
        : null,
    steps: buildSteps(current, new Date(order.created_at), order.delivered_at),
    partner: mockPartner(order),
  };
}

export async function updateOrderFulfillmentAdmin(
  orderId: number,
  status: FulfillmentStatus
): Promise<void> {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw new HttpError(404, "Order not found");
  await orderRepo.updateFulfillmentStatus(orderId, status);
  if (status === "delivered" && order.status === "confirmed" && order.payment_method === "cod") {
    /* COD payment still collected separately via mark-cod-paid */
  }
}
