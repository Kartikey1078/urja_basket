import type { PoolConnection } from "mysql2/promise";

import { HttpError } from "../../errors/httpError";
import { pool } from "../../database/pool";
import * as inventoryRepo from "../inventory/repositories/inventory.repository";
import type { PosCartLineInput, PosOrderDetail } from "./pos.types";
import * as posRepo from "./pos.repository";

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function searchProducts(query: string) {
  return posRepo.searchPosProducts(query);
}

export async function createPendingOrder(lines: PosCartLineInput[]) {
  if (!lines.length) {
    throw new HttpError(400, "Cart is empty");
  }

  const resolved = await Promise.all(lines.map((line) => posRepo.resolveCartLine(line)));
  const subtotal = roundMoney(resolved.reduce((sum, l) => sum + l.lineTotal, 0));
  const grandTotal = subtotal;

  let orderId = 0;
  let orderNumber = "";
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    orderNumber = posRepo.generatePosOrderNumber();
    orderId = await posRepo.insertPosOrder(conn, {
      orderNumber,
      subtotal,
      grandTotal,
      items: resolved,
    });
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e instanceof HttpError ? e : new HttpError(400, e instanceof Error ? e.message : "Could not create order");
  } finally {
    conn.release();
  }

  return { id: orderId, orderNumber, subtotal, grandTotal, status: "pending_payment" as const };
}

async function deductStockForOrder(conn: PoolConnection, orderId: number): Promise<void> {
  const items = await posRepo.findPosOrderItems(orderId, conn);
  for (const item of items) {
    const check = await inventoryRepo.checkLineAvailability(
      item.product_id,
      item.variant_label,
      item.quantity
    );
    if (!check.ok) {
      throw new HttpError(
        400,
        `Insufficient stock for ${item.product_name}${item.variant_label ? ` (${item.variant_label})` : ""}`
      );
    }
  }

  for (const item of items) {
    await inventoryRepo.deductLineStock(
      conn,
      item.product_id,
      item.variant_label,
      item.quantity
    );
    await posRepo.insertInventoryMovement(conn, {
      productId: item.product_id,
      variantId: item.variant_id,
      delta: -item.quantity,
      reason: "pos_sale",
      orderId,
    });
  }
}

export async function completeCashPayment(orderId: number, receivedAmount: number) {
  if (!Number.isFinite(receivedAmount) || receivedAmount <= 0) {
    throw new HttpError(400, "Enter a valid cash amount");
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const order = await posRepo.findPosOrderByIdForUpdate(conn, orderId);
    if (!order) throw new HttpError(404, "Order not found");
    if (order.status !== "pending_payment") {
      throw new HttpError(400, "Order is not awaiting payment");
    }

    const grandTotal = Number(order.grand_total);
    if (receivedAmount < grandTotal) {
      throw new HttpError(400, `Received amount must be at least ₹${grandTotal.toFixed(2)}`);
    }

    await deductStockForOrder(conn, orderId);

    const cashChange = roundMoney(receivedAmount - grandTotal);
    await posRepo.markPosOrderPaid(conn, orderId);
    await posRepo.insertPosPayment(conn, {
      orderId,
      method: "cash",
      amount: grandTotal,
      cashReceived: roundMoney(receivedAmount),
      cashChange,
    });

    await conn.commit();

    return {
      orderId,
      orderNumber: order.order_number,
      grandTotal,
      cashReceived: roundMoney(receivedAmount),
      cashChange,
      status: "paid" as const,
    };
  } catch (e) {
    await conn.rollback();
    throw e instanceof HttpError ? e : new HttpError(500, e instanceof Error ? e.message : "Payment failed");
  } finally {
    conn.release();
  }
}

export async function cancelPendingOrder(orderId: number) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const order = await posRepo.findPosOrderByIdForUpdate(conn, orderId);
    if (!order) throw new HttpError(404, "Order not found");
    if (order.status !== "pending_payment") {
      throw new HttpError(400, "Only unpaid orders can be cancelled");
    }
    await posRepo.markPosOrderCancelled(conn, orderId);
    await conn.commit();
    return { id: orderId, status: "cancelled" as const };
  } catch (e) {
    await conn.rollback();
    throw e instanceof HttpError ? e : new HttpError(500, "Could not cancel order");
  } finally {
    conn.release();
  }
}

export async function getOrderDetail(orderId: number): Promise<PosOrderDetail> {
  const order = await posRepo.findPosOrderById(orderId);
  if (!order) throw new HttpError(404, "Order not found");
  const items = await posRepo.findPosOrderItems(orderId);
  const payment = await posRepo.findPosPaymentByOrderId(orderId);
  return { order, items, payment };
}

export async function listOrders(filters?: {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const limit = filters?.limit ?? 50;
  const page = filters?.page ?? 1;
  const offset = (page - 1) * limit;
  const status =
    filters?.status === "pending_payment" ||
    filters?.status === "paid" ||
    filters?.status === "cancelled" ||
    filters?.status === "failed"
      ? filters.status
      : undefined;

  const { items, total } = await posRepo.listPosOrders({
    q: filters?.q,
    status,
    limit,
    offset,
  });

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function buildInvoiceHtml(detail: PosOrderDetail): string {
  const { order, items, payment } = detail;
  const lines = items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.product_name)}${item.variant_label ? ` <small>(${escapeHtml(item.variant_label)})</small>` : ""}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${Number(item.unit_price).toFixed(2)}</td>
        <td style="text-align:right">₹${Number(item.line_total).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const paidLine = payment
    ? `<p><strong>Payment:</strong> ${payment.method.replace("_", " ")} · ₹${Number(payment.amount).toFixed(2)}${
        payment.cash_change != null ? ` · Change ₹${Number(payment.cash_change).toFixed(2)}` : ""
      }</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(order.order_number)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 24px auto; color: #111; }
    h1 { font-size: 1.25rem; margin: 0 0 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th, td { padding: 8px 4px; border-bottom: 1px solid #e5e7eb; }
    th { text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; }
    .total { font-size: 1.125rem; font-weight: 700; text-align: right; margin-top: 12px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>Urja Basket</h1>
  <p style="margin:0;color:#64748b">${escapeHtml(order.order_number)}</p>
  <p style="margin:4px 0 0;font-size:13px;color:#64748b">${new Date(order.created_at).toLocaleString("en-IN")}</p>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
    <tbody>${lines}</tbody>
  </table>
  <div class="total">Total: ₹${Number(order.grand_total).toFixed(2)}</div>
  ${paidLine}
  <p style="margin-top:24px;font-size:12px;color:#64748b">Thank you for shopping with us.</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function getInvoiceHtml(orderId: number): Promise<string> {
  const detail = await getOrderDetail(orderId);
  if (detail.order.status !== "paid") {
    throw new HttpError(400, "Invoice available for paid orders only");
  }
  return buildInvoiceHtml(detail);
}

/** One-step checkout: create order + cash pay (for faster POS flow). */
export async function checkoutCash(lines: PosCartLineInput[], receivedAmount: number) {
  const pending = await createPendingOrder(lines);
  const paid = await completeCashPayment(pending.id, receivedAmount);
  return { ...pending, ...paid };
}
