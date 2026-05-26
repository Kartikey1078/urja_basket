import { Router } from "express";

import { asyncHandler } from "../../../middleware/asyncHandler";
import { requireApiAuth } from "../../../middleware/requireApiAuth";
import * as orderController from "../controllers/order.controller";

export const orderRouter = Router();

/** Tracking allows guest access with ?phone= */
orderRouter.get("/:id/tracking", asyncHandler(orderController.getOrderTracking));

orderRouter.use(requireApiAuth);

orderRouter.get("/", asyncHandler(orderController.listMyOrders));
orderRouter.get("/:id", asyncHandler(orderController.getOrderById));
