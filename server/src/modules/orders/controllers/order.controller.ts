import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";

import { HttpError } from "../../../errors/httpError";
import { findUserByClerkId } from "../../users/repositories/user.repository";
import * as orderRepo from "../repositories/order.repository";
import * as trackingService from "../services/order-tracking.service";

export async function listMyOrders(req: Request, res: Response) {
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    throw new HttpError(401, "Unauthorized");
  }
  const user = await findUserByClerkId(clerkId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const rows = await orderRepo.listOrdersByUserId(user.id);
  const data = rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentMethod: row.payment_method ?? "online",
    fulfillmentStatus: row.fulfillment_status ?? "order_placed",
    grandTotal: Number(row.grand_total),
    deliverySlot: row.delivery_slot,
    customerName: row.customer_name,
    address: row.address_snapshot,
    paidAt: row.paid_at,
    deliveredAt: row.delivered_at,
    estimatedDeliveryAt: row.estimated_delivery_at,
    createdAt: row.created_at,
    isActive:
      row.fulfillment_status !== "delivered" &&
      row.fulfillment_status !== "cancelled" &&
      row.status !== "failed" &&
      !(row.status === "pending_payment" && row.payment_method !== "cod"),
  }));

  res.json({ data });
}

export async function getOrderById(req: Request, res: Response) {
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    throw new HttpError(401, "Unauthorized");
  }
  const user = await findUserByClerkId(clerkId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, "Invalid order id");
  }

  const order = await orderRepo.findOrderById(id);
  if (!order || order.user_id !== user.id) {
    throw new HttpError(404, "Order not found");
  }

  const items = await orderRepo.listOrderItems(id);

  res.json({
    data: {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentMethod: order.payment_method ?? "online",
      fulfillmentStatus: order.fulfillment_status ?? "order_placed",
      grandTotal: Number(order.grand_total),
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.delivery_fee),
      discount: Number(order.discount),
      deliverySlot: order.delivery_slot,
      address: order.address_snapshot,
      razorpayOrderId: order.razorpay_order_id,
      paidAt: order.paid_at,
      deliveredAt: order.delivered_at,
      estimatedDeliveryAt: order.estimated_delivery_at,
      createdAt: order.created_at,
      items: items.map((item) => ({
        id: item.id,
        slug: item.product_slug,
        name: item.product_name,
        subtitle: item.product_subtitle,
        image: item.product_image,
        unitPrice: Number(item.unit_price),
        quantity: item.quantity,
        lineTotal: Number(item.line_total),
      })),
    },
  });
}

/** Live order tracking — auth via Clerk or ?phone= matching order phone (guests). */
export async function getOrderTracking(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, "Invalid order id");
  }

  const clerkId = getAuth(req).userId;
  let userId: number | null = null;
  if (clerkId) {
    const user = await findUserByClerkId(clerkId);
    userId = user?.id ?? null;
  }

  const phone =
    typeof req.query.phone === "string" ? req.query.phone.trim() : undefined;

  const data = await trackingService.getOrderTracking(id, {
    userId,
    phone: phone || null,
  });

  res.json({ data });
}
