import { getAuth } from "@clerk/express";
import type { Request } from "express";

import type { CreateCheckoutInput } from "../../orders/order.types";
import * as orderService from "../../orders/services/order.service";

/** @deprecated Use orderService.createCheckoutWithRazorpay — kept for imports */
export type RazorpayOrderDto = Awaited<
  ReturnType<typeof orderService.createCheckoutWithRazorpay>
>;

export async function createCheckoutOrder(req: Request, body: CreateCheckoutInput) {
  return orderService.placeCheckout(req, body);
}

export async function verifyAndFulfillPayment(
  req: Request,
  input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
) {
  const { userId } = getAuth(req);
  return orderService.completeRazorpayPayment({
    ...input,
    clerkId: userId ?? null,
  });
}
