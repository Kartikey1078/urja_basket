import crypto from "node:crypto";

import Razorpay from "razorpay";

import { env } from "../../../config/env";
import { HttpError } from "../../../errors/httpError";
import { mapDbError } from "../../../errors/mapDbError";

function getClient() {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new HttpError(503, "Razorpay is not configured on the server");
  }
  return new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });
}

function wrapRazorpayError(err: unknown): never {
  if (err instanceof HttpError) throw err;
  const dbMapped = mapDbError(err);
  if (dbMapped) throw dbMapped;

  const rzp = err as {
    error?: { description?: string; reason?: string };
    message?: string;
  };
  const message =
    rzp.error?.description ??
    rzp.error?.reason ??
    rzp.message ??
    "Could not complete Razorpay request";
  throw new HttpError(502, message);
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
}): Promise<{ orderId: string; currency: string; keyId: string; receipt: string }> {
  try {
    const razorpay = getClient();
    const order = await razorpay.orders.create({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
    });
    if (!order.id) {
      throw new HttpError(502, "Razorpay returned an invalid order");
    }
    return {
      orderId: order.id,
      currency: order.currency ?? "INR",
      keyId: env.razorpay.keyId,
      receipt: order.receipt ?? input.receipt,
    };
  } catch (err) {
    wrapRazorpayError(err);
  }
}

export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  if (!env.razorpay.keySecret) {
    throw new HttpError(503, "Razorpay is not configured on the server");
  }
  const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(payload)
    .digest("hex");
  return expected === input.razorpaySignature;
}
