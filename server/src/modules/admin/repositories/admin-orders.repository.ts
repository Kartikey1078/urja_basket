import type { RowDataPacket } from "mysql2";

import { pool } from "../../../database/pool";
import type { AddressSnapshot, OrderItemRow, OrderStatus, PaymentStatus } from "../../orders/order.types";
import { findOrderById, listOrderItems } from "../../orders/repositories/order.repository";
import { findUserById } from "../../users/repositories/user.repository";

function parseAddressSnapshot(raw: unknown): AddressSnapshot {
  if (raw == null) {
    return {
      fullName: "",
      phoneNumber: "",
      formatted: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
    };
  }
  if (typeof raw === "string") return JSON.parse(raw) as AddressSnapshot;
  return raw as AddressSnapshot;
}

export type AdminOrderListRow = {
  id: number;
  order_number: string;
  user_id: number | null;
  status: OrderStatus;
  delivery_slot: string | null;
  grand_total: string;
  amount_paise: number;
  customer_name: string;
  customer_phone: string;
  razorpay_order_id: string | null;
  paid_at: Date | null;
  created_at: Date;
  user_name: string | null;
  user_email: string | null;
  user_clerk_id: string | null;
  payment_method: string;
  payment_status: PaymentStatus | null;
  razorpay_payment_id: string | null;
};

export type AdminPaymentListRow = {
  id: number;
  order_id: number;
  order_number: string;
  order_status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  user_id: number | null;
  user_email: string | null;
  provider: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  paid_at: Date | null;
  created_at: Date;
};

export type AdminCustomerListRow = {
  id: number;
  clerk_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  created_at: Date;
  order_count: number;
  paid_order_count: number;
  total_spent: string;
  last_order_at: Date | null;
};

type OrderListPacket = AdminOrderListRow & RowDataPacket;
type PaymentListPacket = AdminPaymentListRow & RowDataPacket;
type CustomerListPacket = AdminCustomerListRow & RowDataPacket;

export async function listOrdersAdmin(options?: {
  status?: OrderStatus;
  limit?: number;
}): Promise<AdminOrderListRow[]> {
  const limit = Math.min(200, Math.max(1, options?.limit ?? 100));
  const params: (string | number)[] = [];
  let where = "";
  if (options?.status) {
    where = "WHERE o.status = ?";
    params.push(options.status);
  }
  params.push(limit);

  const [rows] = await pool.query<OrderListPacket[]>(
    `SELECT
      o.id, o.order_number, o.user_id, o.status, o.payment_method, o.delivery_slot,
      o.grand_total, o.amount_paise, o.customer_name, o.customer_phone,
      o.razorpay_order_id, o.paid_at, o.created_at,
      u.name AS user_name, u.email AS user_email, u.clerk_id AS user_clerk_id,
      p.status AS payment_status, p.razorpay_payment_id
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     LEFT JOIN payments p ON p.order_id = o.id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT ?`,
    params
  );
  return rows;
}

export async function getOrderAdminDetail(orderId: number) {
  const order = await findOrderById(orderId);
  if (!order) return null;

  const items = await listOrderItems(orderId);

  const [paymentRows] = await pool.query<
    (RowDataPacket & {
      id: number;
      order_id: number;
      provider: string;
      razorpay_order_id: string;
      razorpay_payment_id: string | null;
      razorpay_signature: string | null;
      amount_paise: number;
      currency: string;
      status: PaymentStatus;
      paid_at: Date | null;
      created_at: Date;
    })[]
  >("SELECT * FROM payments WHERE order_id = ? LIMIT 1", [orderId]);

  const payment = paymentRows[0] ?? null;
  const user = order.user_id ? await findUserById(order.user_id) : null;

  return {
    order: {
      ...order,
      address_snapshot: parseAddressSnapshot(order.address_snapshot),
    },
    items: items as OrderItemRow[],
    payment,
    user: user
      ? {
          id: user.id,
          clerk_id: user.clerk_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          image: user.image,
          created_at: user.created_at,
        }
      : null,
  };
}

export async function listPaymentsAdmin(options?: {
  status?: PaymentStatus;
  limit?: number;
}): Promise<AdminPaymentListRow[]> {
  const limit = Math.min(200, Math.max(1, options?.limit ?? 100));
  const params: (string | number)[] = [];
  let where = "";
  if (options?.status) {
    where = "WHERE p.status = ?";
    params.push(options.status);
  }
  params.push(limit);

  const [rows] = await pool.query<PaymentListPacket[]>(
    `SELECT
      p.id, p.order_id, p.provider, p.razorpay_order_id, p.razorpay_payment_id,
      p.amount_paise, p.currency, p.status, p.paid_at, p.created_at,
      o.order_number, o.status AS order_status, o.customer_name, o.customer_phone,
      o.user_id, u.email AS user_email
     FROM payments p
     INNER JOIN orders o ON o.id = p.order_id
     LEFT JOIN users u ON u.id = o.user_id
     ${where}
     ORDER BY p.created_at DESC
     LIMIT ?`,
    params
  );
  return rows;
}

export async function listCustomersAdmin(limit = 100): Promise<AdminCustomerListRow[]> {
  const cap = Math.min(200, Math.max(1, limit));
  const [rows] = await pool.query<CustomerListPacket[]>(
    `SELECT
      u.id, u.clerk_id, u.name, u.email, u.phone, u.image, u.created_at,
      COUNT(o.id) AS order_count,
      SUM(CASE WHEN o.status = 'paid' THEN 1 ELSE 0 END) AS paid_order_count,
      COALESCE(SUM(CASE WHEN o.status = 'paid' THEN o.grand_total ELSE 0 END), 0) AS total_spent,
      MAX(o.created_at) AS last_order_at
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     GROUP BY u.id
     ORDER BY last_order_at DESC, u.created_at DESC
     LIMIT ?`,
    [cap]
  );
  return rows.map((r) => ({
    ...r,
    order_count: Number(r.order_count),
    paid_order_count: Number(r.paid_order_count),
    total_spent: String(r.total_spent),
  }));
}

export async function getCustomerAdminDetail(userId: number) {
  const user = await findUserById(userId);
  if (!user) return null;

  const orders = await listOrdersAdminForUser(userId);

  return { user, orders };
}

async function listOrdersAdminForUser(userId: number): Promise<AdminOrderListRow[]> {
  const [rows] = await pool.query<OrderListPacket[]>(
    `SELECT
      o.id, o.order_number, o.user_id, o.status, o.payment_method, o.delivery_slot,
      o.grand_total, o.amount_paise, o.customer_name, o.customer_phone,
      o.razorpay_order_id, o.paid_at, o.created_at,
      u.name AS user_name, u.email AS user_email, u.clerk_id AS user_clerk_id,
      p.status AS payment_status, p.razorpay_payment_id
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     LEFT JOIN payments p ON p.order_id = o.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC
     LIMIT 50`,
    [userId]
  );
  return rows;
}
