import type { Request, Response } from "express";

import { HttpError } from "../../errors/httpError";
import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "../orders/order.types";
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

export async function adminListOrders(req: Request, res: Response) {
  const status = parseOrderStatus(req.query.status);
  const data = await adminOrdersRepo.listOrdersAdmin({ status });
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
  const data = await adminOrdersRepo.listPaymentsAdmin({ status });
  res.json({ data });
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
