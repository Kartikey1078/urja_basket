import type { Request, Response } from "express";

import { HttpError } from "../../../errors/httpError";
import type { CreateCheckoutInput } from "../../orders/order.types";
import * as razorpayService from "../services/razorpay.service";

export function razorpayOrderInfo(_req: Request, res: Response) {
  res.status(405).json({
    error: "Method not allowed. Use POST /api/v1/payments/razorpay/order with JSON body.",
    example: {
      method: "POST",
      body: {
        amountPaise: 50000,
        paymentMethod: "online",
        deliverySlot: "express",
        address: {
          fullName: "Name",
          phoneNumber: "9876543210",
          formatted: "Full address line",
          city: "Panipat",
          state: "Haryana",
          postalCode: "132103",
        },
      },
    },
  });
}

export async function createRazorpayOrder(req: Request, res: Response) {
  const body = (req.body ?? {}) as CreateCheckoutInput;
  if (!body.address) {
    throw new HttpError(400, "Delivery address is required");
  }
  const data = await razorpayService.createCheckoutOrder(req, body);
  res.status(201).json({ data });
}

export async function verifyRazorpayPayment(req: Request, res: Response) {
  const body = req.body as {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };

  const razorpayOrderId = body.razorpayOrderId?.trim();
  const razorpayPaymentId = body.razorpayPaymentId?.trim();
  const razorpaySignature = body.razorpaySignature?.trim();

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new HttpError(400, "Missing payment verification fields");
  }

  const data = await razorpayService.verifyAndFulfillPayment(req, {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  res.json({ data });
}
