import type { PoolConnection, RowDataPacket } from "mysql2/promise";

import { HttpError } from "../../../errors/httpError";
import { pool } from "../../../database/pool";
import type {
  FulfillmentStatus,
  OrderRow,
  PaymentMethod,
} from "../../orders/order.types";
import * as orderRepo from "../../orders/repositories/order.repository";
import type { CheckoutSnapshot } from "../../orders/order.types";
import * as inventoryRepo from "../repositories/inventory.repository";

const COD_RESERVE_FULFILLMENT: FulfillmentStatus[] = [
  "preparing",
  "out_for_delivery",
  "delivered",
];

function isEligiblePaymentStatus(order: OrderRow): boolean {
  return order.status !== "failed" && order.status !== "cancelled";
}

export function shouldDeductForFulfillment(
  order: OrderRow,
  fulfillmentStatus: FulfillmentStatus
): boolean {
  if (order.inventory_deducted_at) return false;
  if (!isEligiblePaymentStatus(order)) return false;

  const method: PaymentMethod = order.payment_method ?? "online";

  if (method === "online") {
    return false;
  }

  if (method === "cod") {
    const accepted =
      order.status === "pending_payment" ||
      order.status === "confirmed" ||
      order.status === "paid";
    return accepted && COD_RESERVE_FULFILLMENT.includes(fulfillmentStatus);
  }

  return false;
}

export function shouldDeductForOnlinePayment(order: OrderRow): boolean {
  if (order.inventory_deducted_at) return false;
  if (!isEligiblePaymentStatus(order)) return false;
  return (order.payment_method ?? "online") === "online" && order.status === "paid";
}

export function shouldDeductForOrderConfirmed(order: OrderRow): boolean {
  if (order.inventory_deducted_at) return false;
  if (!isEligiblePaymentStatus(order)) return false;
  return order.payment_method === "cod" && order.status === "confirmed";
}

export function shouldRestoreInventory(
  order: OrderRow,
  fulfillmentStatus?: FulfillmentStatus
): boolean {
  if (!order.inventory_deducted_at) return false;
  if (fulfillmentStatus === "cancelled") return true;
  if (order.status === "cancelled" || order.status === "failed") return true;
  return false;
}

export async function assertCheckoutStockAvailable(snapshot: CheckoutSnapshot): Promise<void> {
  for (const item of snapshot.items) {
    if (!item.productId || item.quantity <= 0) continue;
    const check = await inventoryRepo.checkLineAvailability(
      item.productId,
      item.subtitle || null,
      item.quantity
    );
    if (!check.ok) {
      throw new HttpError(
        400,
        `Insufficient stock for "${item.name}". Only ${check.available} available.`
      );
    }
  }
}

async function deductOrderItems(conn: PoolConnection, orderId: number): Promise<void> {
  const items = await orderRepo.listOrderItems(orderId);
  for (const item of items) {
    if (!item.product_id || item.quantity <= 0) continue;
    await inventoryRepo.deductLineStock(
      conn,
      item.product_id,
      item.product_subtitle,
      item.quantity
    );
  }
}

async function restoreOrderItems(conn: PoolConnection, orderId: number): Promise<void> {
  const items = await orderRepo.listOrderItems(orderId);
  for (const item of items) {
    if (!item.product_id || item.quantity <= 0) continue;
    await inventoryRepo.restoreLineStock(
      conn,
      item.product_id,
      item.product_subtitle,
      item.quantity
    );
  }
}

export async function deductInventoryForOrder(orderId: number): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderRows] = await conn.query<(OrderRow & RowDataPacket)[]>(
      "SELECT * FROM orders WHERE id = ? FOR UPDATE",
      [orderId]
    );
    const order = orderRows[0];
    if (!order || order.inventory_deducted_at) {
      await conn.commit();
      return false;
    }

    await deductOrderItems(conn, orderId);
    await conn.query(
      "UPDATE orders SET inventory_deducted_at = CURRENT_TIMESTAMP WHERE id = ?",
      [orderId]
    );
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function restoreInventoryForOrder(orderId: number): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderRows] = await conn.query<(OrderRow & RowDataPacket)[]>(
      "SELECT * FROM orders WHERE id = ? FOR UPDATE",
      [orderId]
    );
    const order = orderRows[0];
    if (!order || !order.inventory_deducted_at) {
      await conn.commit();
      return false;
    }

    await restoreOrderItems(conn, orderId);
    await conn.query("UPDATE orders SET inventory_deducted_at = NULL WHERE id = ?", [orderId]);
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function maybeDeductInventoryForOrder(order: OrderRow, fulfillmentStatus?: FulfillmentStatus): Promise<void> {
  const fulfillment = fulfillmentStatus ?? order.fulfillment_status;
  const shouldDeduct =
    shouldDeductForFulfillment(order, fulfillment) ||
    shouldDeductForOrderConfirmed(order);

  if (!shouldDeduct) return;

  try {
    await deductInventoryForOrder(order.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Inventory deduction failed";
    throw new HttpError(409, message);
  }
}

export async function maybeDeductInventoryAfterOnlinePayment(orderId: number): Promise<void> {
  const order = await orderRepo.findOrderById(orderId);
  if (!order || !shouldDeductForOnlinePayment(order)) return;

  try {
    await deductInventoryForOrder(orderId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Inventory deduction failed";
    throw new HttpError(409, message);
  }
}

export async function maybeRestoreInventoryForOrder(
  order: OrderRow,
  fulfillmentStatus?: FulfillmentStatus
): Promise<void> {
  if (!shouldRestoreInventory(order, fulfillmentStatus)) return;
  await restoreInventoryForOrder(order.id);
}
