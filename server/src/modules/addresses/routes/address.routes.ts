import { Router } from "express";

import { asyncHandler } from "../../../middleware/asyncHandler";
import { requireApiAuth } from "../../../middleware/requireApiAuth";
import * as addressController from "../controllers/address.controller";

export const addressRouter = Router();

addressRouter.use(requireApiAuth);

addressRouter.get("/", asyncHandler(addressController.listAddresses));
addressRouter.post("/", asyncHandler(addressController.createAddress));
addressRouter.patch(
  "/:id/default",
  asyncHandler(addressController.setDefaultAddress)
);
addressRouter.patch("/:id", asyncHandler(addressController.updateAddress));
addressRouter.delete("/:id", asyncHandler(addressController.deleteAddress));
