import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../../../database/pool";
import type {
  AddressSnapshot,
  OrderItemRow,
  OrderRow,
  FulfillmentStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../order.types";

type OrderRowPacket = OrderRow & RowDataPacket;
type OrderItemRowPacket = OrderItemRow & RowDataPacket;

export async function insertOrder(input: {
  orderNumber: string;
  userId: number | null;
  addressId: number | null;
  deliverySlot: string | null;
  totals: {
    subtotal: number;
    deliveryFee: number;
    deliveryFeeWaived: boolean;
    platformFee: number;
    discount: number;
    tax: number;
    grandTotal: number;
    amountPaise: number;
  };
  customerName: string;
  customerPhone: string;
  addressSnapshot: AddressSnapshot;
  razorpayOrderId: string | null;
  razorpayReceipt: string | null;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  fulfillmentStatus?: FulfillmentStatus;
  estimatedDeliveryAt?: Date | null;
  couponId?: number | null;
  couponCode?: string | null;
  couponDiscount?: number;
}): Promise<number> {
  const status = input.status ?? "pending_payment";
  const paymentMethod = input.paymentMethod ?? "online";
  const fulfillmentStatus = input.fulfillmentStatus ?? "order_placed";
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO orders (
      order_number, user_id, coupon_id, coupon_code, address_id, status, payment_method, fulfillment_status,
      delivery_slot, currency,
      subtotal, delivery_fee, delivery_fee_waived, platform_fee, discount, coupon_discount, tax,
      grand_total, amount_paise, customer_name, customer_phone, address_snapshot,
      razorpay_order_id, razorpay_receipt, estimated_delivery_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.orderNumber,
      input.userId,
      input.couponId ?? null,
      input.couponCode ?? null,
      input.addressId,
      status,
      paymentMethod,
      fulfillmentStatus,
      input.deliverySlot,
      input.totals.subtotal,
      input.totals.deliveryFee,
      input.totals.deliveryFeeWaived ? 1 : 0,
      input.totals.platformFee,
      input.totals.discount,
      input.couponDiscount ?? 0,
      input.totals.tax,
      input.totals.grandTotal,
      input.totals.amountPaise,
      input.customerName,
      input.customerPhone,
      JSON.stringify(input.addressSnapshot),
      input.razorpayOrderId,
      input.razorpayReceipt,
      input.estimatedDeliveryAt ?? null,
    ]
  );
  return result.insertId;
}

export async function updateFulfillmentStatus(
  orderId: number,
  status: FulfillmentStatus
): Promise<void> {
  const sets = ["fulfillment_status = ?"];
  const params: (string | number)[] = [status, orderId];
  if (status === "delivered") {
    sets.push("delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP)");
  }
  await pool.query(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`, params);
}

export async function setEstimatedDelivery(orderId: number, at: Date): Promise<void> {
  await pool.query("UPDATE orders SET estimated_delivery_at = ? WHERE id = ?", [at, orderId]);
}

export async function insertOrderItems(
  orderId: number,
  items: {
    productId: number | null;
    slug: string;
    name: string;
    subtitle: string | null;
    image: string | null;
    unitPrice: number;
    mrp: number;
    quantity: number;
    lineTotal: number;
  }[]
): Promise<void> {
  if (items.length === 0) return;
  const values = items.map((item) => [
    orderId,
    item.productId,
    item.slug,
    item.name,
    item.subtitle,
    item.image,
    item.unitPrice,
    item.mrp,
    item.quantity,
    item.lineTotal,
  ]);
  await pool.query(
    `INSERT INTO order_items (
      order_id, product_id, product_slug, product_name, product_subtitle,
      product_image, unit_price, mrp, quantity, line_total
    ) VALUES ?`,
    [values]
  );
}

export async function insertPayment(input: {
  orderId: number;
  provider: "razorpay" | "cod";
  externalRef: string;
  amountPaise: number;
  status?: PaymentStatus;
}): Promise<void> {
  const status = input.status ?? (input.provider === "cod" ? "pending_collection" : "created");
  await pool.query(
    `INSERT INTO payments (order_id, provider, razorpay_order_id, amount_paise, currency, status)
     VALUES (?, ?, ?, ?, 'INR', ?)`,
    [input.orderId, input.provider, input.externalRef, input.amountPaise, status]
  );
}

export async function markCodPaymentCollected(input: {
  orderId: number;
  collectedRef: string;
}): Promise<void> {
  await pool.query(
    `UPDATE payments SET
      status = 'paid',
      razorpay_payment_id = ?,
      paid_at = CURRENT_TIMESTAMP
     WHERE order_id = ? AND provider = 'cod'`,
    [input.collectedRef, input.orderId]
  );
}

export async function updateOrderRazorpayIds(
  orderId: number,
  razorpayOrderId: string,
  receipt: string
): Promise<void> {
  await pool.query(
    "UPDATE orders SET razorpay_order_id = ?, razorpay_receipt = ? WHERE id = ?",
    [razorpayOrderId, receipt, orderId]
  );
}

export async function findOrderByRazorpayOrderId(
  razorpayOrderId: string
): Promise<OrderRow | null> {
  const [rows] = await pool.query<OrderRowPacket[]>(
    "SELECT * FROM orders WHERE razorpay_order_id = ? LIMIT 1",
    [razorpayOrderId]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    address_snapshot:
      typeof row.address_snapshot === "string"
        ? (JSON.parse(row.address_snapshot) as AddressSnapshot)
        : (row.address_snapshot as AddressSnapshot),
  };
}

export async function markOrderPaid(orderId: number): Promise<void> {
  await pool.query(
    `UPDATE orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP,
      fulfillment_status = CASE
        WHEN fulfillment_status = 'order_placed' THEN 'preparing'
        ELSE fulfillment_status
      END
     WHERE id = ?`,
    [orderId]
  );
}

export async function markOrderFailed(orderId: number): Promise<void> {
  await pool.query("UPDATE orders SET status = 'failed' WHERE id = ?", [orderId]);
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
}

export async function markOrderCancelled(orderId: number): Promise<void> {
  await pool.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [orderId]);
}

export async function markPaymentRefunded(orderId: number): Promise<void> {
  await pool.query(
    `UPDATE payments SET status = 'refunded' WHERE order_id = ? AND status = 'paid'`,
    [orderId]
  );
}

export async function markPaymentPaid(input: {
  orderId: number;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<void> {
  await pool.query(
    `UPDATE payments SET
      status = 'paid',
      razorpay_payment_id = ?,
      razorpay_signature = ?,
      paid_at = CURRENT_TIMESTAMP
     WHERE order_id = ?`,
    [input.razorpayPaymentId, input.razorpaySignature, input.orderId]
  );
}

export async function findOrderById(id: number): Promise<OrderRow | null> {
  const [rows] = await pool.query<OrderRowPacket[]>(
    "SELECT * FROM orders WHERE id = ? LIMIT 1",
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    address_snapshot:
      typeof row.address_snapshot === "string"
        ? (JSON.parse(row.address_snapshot) as AddressSnapshot)
        : (row.address_snapshot as AddressSnapshot),
  };
}

export async function listOrderItems(orderId: number): Promise<OrderItemRow[]> {
  const [rows] = await pool.query<OrderItemRowPacket[]>(
    "SELECT * FROM order_items WHERE order_id = ? ORDER BY id",
    [orderId]
  );
  return rows;
}

export async function listOrdersByUserId(userId: number, limit = 20): Promise<OrderRow[]> {
  const [rows] = await pool.query<OrderRowPacket[]>(
    `SELECT * FROM orders WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows.map((row) => ({
    ...row,
    address_snapshot:
      typeof row.address_snapshot === "string"
        ? (JSON.parse(row.address_snapshot) as AddressSnapshot)
        : (row.address_snapshot as AddressSnapshot),
  }));
}
