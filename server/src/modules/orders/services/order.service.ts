import { getAuth } from "@clerk/express";
import type { Request } from "express";

import { HttpError } from "../../../errors/httpError";
import { mapDbError } from "../../../errors/mapDbError";
import type { CartLineDto, CartResponse } from "../../cart/cart.types";
import * as cartRepo from "../../cart/repositories/cart.repository";
import * as cartService from "../../cart/services/cart.service";
import { computeCartTotals } from "../../cart/services/cart-pricing.service";
import { getPricingConfig, getSiteSettings } from "../../settings/settings.service";
import { findUserByClerkId } from "../../users/repositories/user.repository";
import type {
  AddressSnapshot,
  CheckoutSnapshot,
  CheckoutPlaceResult,
  CodPlacedOrderDto,
  CreateCheckoutInput,
  OrderStatus,
  PaymentVerifiedDto,
  RazorpayCheckoutResult,
} from "../order.types";
import * as orderRepo from "../repositories/order.repository";
import { estimateDeliveryAt } from "./order-tracking.service";
import * as razorpayCheckout from "../../payments/services/razorpay-client.service";

function parseMoney(value: string | null | undefined): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function lineFromCartRow(row: {
  id: number;
  product_id: number;
  slug: string;
  name: string;
  card_weight: string | null;
  card_price: string | null;
  card_original_price: string | null;
  main_image: string | null;
  is_organic: number;
  is_best_seller: number;
  quantity: number;
}): CartLineDto {
  const price = parseMoney(row.card_price);
  const mrp = parseMoney(row.card_original_price) || price;
  return {
    lineItemId: row.id,
    productId: row.product_id,
    slug: row.slug,
    name: row.name,
    subtitle: row.card_weight ?? "",
    tag: row.is_best_seller ? "Bestseller" : row.is_organic ? "Organic" : null,
    price,
    mrp,
    image: row.main_image ?? "",
    quantity: row.quantity,
    lineTotal: Math.round(price * row.quantity * 100) / 100,
  };
}

async function buildSnapshotFromServerCart(clerkId: string): Promise<CheckoutSnapshot> {
  const cart: CartResponse = await cartService.getCartForUser(clerkId);
  if (cart.items.length === 0) {
    throw new HttpError(400, "Cart is empty");
  }
  return { items: cart.items, totals: cart.totals };
}

async function buildSnapshotFromGuestItems(
  items: { productSlug: string; quantity: number }[]
): Promise<CheckoutSnapshot> {
  if (items.length === 0) {
    throw new HttpError(400, "Cart is empty");
  }
  const lines: CartLineDto[] = [];
  for (const item of items) {
    const product = await cartRepo.findProductForCartBySlug(item.productSlug);
    if (!product) continue;
    const qty = Math.min(99, Math.max(1, Math.floor(item.quantity)));
    lines.push(
      lineFromCartRow({
        id: 0,
        product_id: product.id,
        slug: product.slug,
        name: product.name,
        card_weight: product.card_weight,
        card_price: product.card_price,
        card_original_price: product.card_original_price,
        main_image: product.main_image,
        is_organic: product.is_organic,
        is_best_seller: product.is_best_seller,
        quantity: qty,
      })
    );
  }
  if (lines.length === 0) {
    throw new HttpError(400, "No valid products in cart");
  }
  const pricing = await getPricingConfig();
  const totals = computeCartTotals(
    lines.map((l) => ({ unitPrice: l.price, quantity: l.quantity })),
    pricing
  );
  return { items: lines, totals };
}

function orderNumber(): string {
  return `UB${Date.now().toString(36).toUpperCase().slice(-8)}`;
}

function normalizeAddress(input: CreateCheckoutInput["address"]): AddressSnapshot {
  if (!input.fullName?.trim() || !input.phoneNumber?.trim()) {
    throw new HttpError(400, "Delivery address name and phone are required");
  }
  if (!input.formatted?.trim() || !input.city?.trim() || !input.postalCode?.trim()) {
    throw new HttpError(400, "Complete delivery address is required");
  }
  return {
    addressId: input.addressId ?? null,
    fullName: input.fullName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    alternatePhone: input.alternatePhone ?? null,
    formatted: input.formatted.trim(),
    city: input.city.trim(),
    state: (input.state ?? "").trim() || "—",
    country: input.country?.trim() || "India",
    postalCode: input.postalCode.trim(),
    addressType: input.addressType,
  };
}

type CheckoutContext = {
  clerkId: string | null | undefined;
  userId: number | null;
  snapshot: CheckoutSnapshot;
  address: AddressSnapshot;
  amountPaise: number;
  addressId: number | null;
  receipt: string;
  orderNumber: string;
};

async function resolveCheckoutContext(
  req: Request,
  input: CreateCheckoutInput
): Promise<CheckoutContext> {
  const { userId: clerkId } = getAuth(req);
  const address = normalizeAddress(input.address);

  let userId: number | null = null;
  let snapshot: CheckoutSnapshot;

  if (clerkId) {
    const user = await findUserByClerkId(clerkId);
    if (!user) {
      throw new HttpError(401, "User profile not found. Call GET /api/me first.");
    }
    userId = user.id;
    try {
      snapshot = await buildSnapshotFromServerCart(clerkId);
    } catch (err) {
      if (input.items?.length) {
        snapshot = await buildSnapshotFromGuestItems(input.items);
      } else {
        throw err;
      }
    }
  } else if (input.items?.length) {
    snapshot = await buildSnapshotFromGuestItems(input.items);
  } else {
    throw new HttpError(400, "Sign in or send cart items to place an order");
  }

  let amountPaise = Math.round(snapshot.totals.grandTotal * 100);
  if (input.amountPaise != null && Number.isInteger(input.amountPaise)) {
    const clientPaise = input.amountPaise;
    const diff = Math.abs(clientPaise - amountPaise);
    if (diff > 100) {
      amountPaise = clientPaise;
    }
  }
  if (amountPaise < 100) {
    throw new HttpError(400, "Order amount is too low");
  }

  const addressId =
    address.addressId && address.addressId > 0 ? address.addressId : null;

  return {
    clerkId,
    userId,
    snapshot,
    address,
    amountPaise,
    addressId,
    receipt: `ub_${Date.now()}`,
    orderNumber: orderNumber(),
  };
}

async function createOrderRecord(
  snapshot: CheckoutSnapshot,
  input: CreateCheckoutInput,
  ctx: CheckoutContext
): Promise<number> {
  const estimatedDeliveryAt = estimateDeliveryAt(input.deliverySlot ?? null);
  return orderRepo.insertOrder({
    orderNumber: ctx.orderNumber,
    userId: ctx.userId,
    addressId: ctx.addressId,
    deliverySlot: input.deliverySlot ?? null,
    totals: {
      subtotal: snapshot.totals.subtotal,
      deliveryFee: snapshot.totals.deliveryFee,
      deliveryFeeWaived: snapshot.totals.deliveryFeeWaived,
      platformFee: snapshot.totals.platformFee,
      discount: snapshot.totals.discount,
      tax: snapshot.totals.tax,
      grandTotal: snapshot.totals.grandTotal,
      amountPaise: ctx.amountPaise,
    },
    customerName: ctx.address.fullName,
    customerPhone: ctx.address.phoneNumber,
    addressSnapshot: ctx.address,
    razorpayOrderId: null,
    razorpayReceipt: ctx.receipt,
    status: input.paymentMethod === "cod" ? "confirmed" : "pending_payment",
    paymentMethod: input.paymentMethod === "cod" ? "cod" : "online",
    fulfillmentStatus: "order_placed",
    estimatedDeliveryAt,
  });
}

async function insertLines(dbOrderId: number, snapshot: CheckoutSnapshot): Promise<void> {
  await orderRepo.insertOrderItems(
    dbOrderId,
    snapshot.items.map((item) => ({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      subtitle: item.subtitle || null,
      image: item.image || null,
      unitPrice: item.price,
      mrp: item.mrp,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    }))
  );
}

async function clearCartForUser(userId: number | null, clerkId?: string | null): Promise<void> {
  if (!userId || !clerkId) return;
  try {
    const cartId = await cartRepo.getOrCreateCartId(userId);
    const rows = await cartRepo.listCartItems(cartId);
    for (const row of rows) {
      await cartRepo.deleteCartItem(row.id, cartId);
    }
  } catch {
    /* best-effort */
  }
}

export async function placeCheckout(
  req: Request,
  input: CreateCheckoutInput
): Promise<CheckoutPlaceResult> {
  const settings = await getSiteSettings();
  if (settings.maintenanceMode) {
    throw new HttpError(503, "Store is temporarily unavailable. Please try again later.");
  }

  const method = input.paymentMethod === "cod" ? "cod" : "online";
  if (method === "cod" && !settings.codEnabled) {
    throw new HttpError(400, "Cash on delivery is not available right now");
  }
  if (method === "online" && !settings.onlinePaymentEnabled) {
    throw new HttpError(400, "Online payment is not available right now");
  }

  if (method === "cod") {
    return createCheckoutWithCod(req, { ...input, paymentMethod: "cod" });
  }
  return createCheckoutWithRazorpay(req, { ...input, paymentMethod: "online" });
}

export async function createCheckoutWithCod(
  req: Request,
  input: CreateCheckoutInput
): Promise<CodPlacedOrderDto> {
  const ctx = await resolveCheckoutContext(req, input);
  const dbOrderId = await createOrderRecord(ctx.snapshot, input, ctx);
  await insertLines(dbOrderId, ctx.snapshot);

  const codRef = `COD-${ctx.orderNumber}`;
  await orderRepo.insertPayment({
    orderId: dbOrderId,
    provider: "cod",
    externalRef: codRef,
    amountPaise: ctx.amountPaise,
    status: "pending_collection",
  });

  await clearCartForUser(ctx.userId, ctx.clerkId);

  return {
    paymentMethod: "cod",
    dbOrderId,
    orderNumber: ctx.orderNumber,
    status: "confirmed",
    grandTotal: ctx.snapshot.totals.grandTotal,
    amountPaise: ctx.amountPaise,
    message: "Pay with cash when your order arrives.",
  };
}

export async function createCheckoutWithRazorpay(
  req: Request,
  input: CreateCheckoutInput
): Promise<RazorpayCheckoutResult> {
  const ctx = await resolveCheckoutContext(req, input);
  const dbOrderId = await createOrderRecord(ctx.snapshot, input, ctx);
  await insertLines(dbOrderId, ctx.snapshot);

  try {
    const rzp = await razorpayCheckout.createRazorpayOrder({
      amountPaise: ctx.amountPaise,
      receipt: ctx.receipt,
    });
    await orderRepo.updateOrderRazorpayIds(dbOrderId, rzp.orderId, rzp.receipt);
    await orderRepo.insertPayment({
      orderId: dbOrderId,
      provider: "razorpay",
      externalRef: rzp.orderId,
      amountPaise: ctx.amountPaise,
    });

    return {
      razorpayOrderId: rzp.orderId,
      amount: ctx.amountPaise / 100,
      amountPaise: ctx.amountPaise,
      currency: rzp.currency,
      keyId: rzp.keyId,
      receipt: rzp.receipt,
      order: {
        dbOrderId,
        orderNumber: ctx.orderNumber,
        status: "pending_payment",
        grandTotal: ctx.snapshot.totals.grandTotal,
        amountPaise: ctx.amountPaise,
      },
    };
  } catch (err) {
    await orderRepo.markOrderFailed(dbOrderId);
    const dbMapped = mapDbError(err);
    if (dbMapped) throw dbMapped;
    throw err;
  }
}

export async function markCodOrderPaidByAdmin(orderId: number): Promise<{
  dbOrderId: number;
  orderNumber: string;
  status: OrderStatus;
}> {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) {
    throw new HttpError(404, "Order not found");
  }
  if (order.payment_method !== "cod") {
    throw new HttpError(400, "This order is not cash on delivery");
  }
  if (order.status === "paid") {
    return {
      dbOrderId: order.id,
      orderNumber: order.order_number,
      status: "paid",
    };
  }
  if (order.status !== "confirmed") {
    throw new HttpError(400, `Cannot mark paid from status: ${order.status}`);
  }

  const collectedRef = `COD-COLLECTED-${Date.now()}`;
  await orderRepo.markOrderPaid(order.id);
  await orderRepo.updateFulfillmentStatus(order.id, "delivered");
  await orderRepo.markCodPaymentCollected({
    orderId: order.id,
    collectedRef,
  });

  return {
    dbOrderId: order.id,
    orderNumber: order.order_number,
    status: "paid",
  };
}

export async function completeRazorpayPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  clerkId?: string | null;
}): Promise<PaymentVerifiedDto> {
  const valid = razorpayCheckout.verifyPaymentSignature(input);
  if (!valid) {
    throw new HttpError(400, "Invalid payment signature");
  }

  const order = await orderRepo.findOrderByRazorpayOrderId(input.razorpayOrderId);
  if (!order) {
    throw new HttpError(404, "Order not found for this payment");
  }

  if (order.status === "paid") {
    return {
      verified: true,
      dbOrderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      status: "paid",
    };
  }

  await orderRepo.markOrderPaid(order.id);
  await orderRepo.markPaymentPaid({
    orderId: order.id,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
  });

  await clearCartForUser(order.user_id, input.clerkId);

  return {
    verified: true,
    dbOrderId: order.id,
    orderNumber: order.order_number,
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    status: "paid",
  };
}
