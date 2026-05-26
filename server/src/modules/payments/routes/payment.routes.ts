import { Router } from "express";

import { asyncHandler } from "../../../middleware/asyncHandler";
import * as paymentController from "../controllers/payment.controller";

export const paymentRouter = Router();

paymentRouter.get("/razorpay/order", paymentController.razorpayOrderInfo);
paymentRouter.post(
  "/razorpay/order",
  asyncHandler(paymentController.createRazorpayOrder)
);
paymentRouter.post(
  "/razorpay/verify",
  asyncHandler(paymentController.verifyRazorpayPayment)
);
