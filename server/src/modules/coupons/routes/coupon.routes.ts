import { Router } from "express";

import { asyncHandler } from "../../../middleware/asyncHandler";
import { requireApiAuth } from "../../../middleware/requireApiAuth";
import * as couponController from "../controllers/coupon.controller";

const couponRouter = Router();

couponRouter.post("/offers", asyncHandler(couponController.listOffers));
couponRouter.post("/preview", asyncHandler(couponController.previewCoupon));

couponRouter.use(requireApiAuth);
couponRouter.post("/apply", asyncHandler(couponController.applyCoupon));
couponRouter.delete("/remove", asyncHandler(couponController.removeCoupon));
couponRouter.post("/best", asyncHandler(couponController.applyBestCoupon));

export { couponRouter };
