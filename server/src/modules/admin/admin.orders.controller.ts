import type { Request, Response } from "express";

import { HttpError } from "../../errors/httpError";
import type {
  FulfillmentStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../orders/order.types";
import * as trackingService from "../orders/services/order-tracking.service";
import * as orderService from "../orders/services/order.service";
import * as adminOrdersRepo from "./repositories/admin-orders.repository";

function paramStr(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parseId(param: string | undefined, label: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return id;
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "confirmed",
  "paid",
  "failed",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "created",
  "paid",
  "failed",
  "pending_collection",
  "refunded",
];

function parseOrderStatus(q: unknown): OrderStatus | undefined {
  if (typeof q !== "string" || !q.trim()) return undefined;
  const s = q.trim() as OrderStatus;
  if (!ORDER_STATUSES.includes(s)) {
    throw new HttpError(400, `Invalid status. Use: ${ORDER_STATUSES.join(", ")}`);
  }
  return s;
}

function parsePaymentStatus(q: unknown): PaymentStatus | undefined {
  if (typeof q !== "string" || !q.trim()) return undefined;
  const s = q.trim() as PaymentStatus;
  if (!PAYMENT_STATUSES.includes(s)) {
    throw new HttpError(400, `Invalid payment status. Use: ${PAYMENT_STATUSES.join(", ")}`);
  }
  return s;
}

function parseSearchQuery(q: unknown, maxLen = 120): string | undefined {
  if (typeof q !== "string") return undefined;
  const s = q.trim();
  if (!s) return undefined;
  return s.slice(0, maxLen);
}

const USER_FILTERS = ["guest", "registered"] as const;
type UserFilter = (typeof USER_FILTERS)[number];

function parseUserFilter(q: unknown): UserFilter | undefined {
  if (typeof q !== "string" || !q.trim()) return undefined;
  const s = q.trim();
  if (!USER_FILTERS.includes(s as UserFilter)) {
    throw new HttpError(400, `Invalid user filter. Use: ${USER_FILTERS.join(", ")}`);
  }
  return s as UserFilter;
}

const PAYMENT_METHODS: PaymentMethod[] = ["online", "cod"];

function parsePaymentMethod(q: unknown): PaymentMethod | undefined {
  if (typeof q !== "string" || !q.trim()) return undefined;
  const s = q.trim() as PaymentMethod;
  if (!PAYMENT_METHODS.includes(s)) {
    throw new HttpError(400, `Invalid pay filter. Use: ${PAYMENT_METHODS.join(", ")}`);
  }
  return s;
}

export async function adminListOrders(req: Request, res: Response) {
  const status = parseOrderStatus(req.query.status);
  const order = parseSearchQuery(req.query.order);
  const customer = parseSearchQuery(req.query.customer);
  const user = parseUserFilter(req.query.user);
  const paymentMethod = parsePaymentMethod(req.query.pay);
  const data = await adminOrdersRepo.listOrdersAdmin({
    status,
    order,
    customer,
    user,
    paymentMethod,
  });
  res.json({ data });
}

export async function adminGetOrder(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "order id");
  const data = await adminOrdersRepo.getOrderAdminDetail(id);
  if (!data) throw new HttpError(404, "Order not found");
  res.json({ data });
}

export async function adminListPayments(req: Request, res: Response) {
  const status = parsePaymentStatus(req.query.status);
  const order = parseSearchQuery(req.query.order);
  const customer = parseSearchQuery(req.query.customer);
  const payment = parseSearchQuery(req.query.payment);
  const orderStatus = parseOrderStatus(req.query.orderStatus);
  const user = parseUserFilter(req.query.user);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const result = await adminOrdersRepo.listPaymentsAdminPaginated({
    status,
    order,
    customer,
    payment,
    orderStatus,
    user,
    page,
    limit,
  });

  res.json({
    data: result.items,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
    },
  });
}

export async function adminListCustomers(_req: Request, res: Response) {
  const data = await adminOrdersRepo.listCustomersAdmin();
  res.json({ data });
}

export async function adminGetCustomer(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "customer id");
  const data = await adminOrdersRepo.getCustomerAdminDetail(id);
  if (!data) throw new HttpError(404, "Customer not found");
  res.json({ data });
}

export async function adminMarkCodPaid(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "order id");
  const data = await orderService.markCodOrderPaidByAdmin(id);
  res.json({ data });
}

export async function adminConfirmCodOrder(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "order id");
  const data = await orderService.confirmCodOrderByAdmin(id);
  res.json({ data });
}

export async function adminCancelOrder(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "order id");
  const data = await orderService.cancelOrderByAdmin(id);
  res.json({ data });
}

export async function adminRefundOrder(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "order id");
  const data = await orderService.refundOnlineOrderByAdmin(id);
  res.json({ data });
}

const FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  "order_placed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export async function adminUpdateFulfillment(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "order id");
  const status = (req.body as { fulfillmentStatus?: string }).fulfillmentStatus?.trim();
  if (!status || !FULFILLMENT_STATUSES.includes(status as FulfillmentStatus)) {
    throw new HttpError(
      400,
      `fulfillmentStatus required: ${FULFILLMENT_STATUSES.join(", ")}`
    );
  }
  await trackingService.updateOrderFulfillmentAdmin(id, status as FulfillmentStatus);
  res.json({ data: { ok: true, fulfillmentStatus: status } });
}
