import { Router } from "express";

import { asyncHandler } from "../../../middleware/asyncHandler";
import { requireApiAuth } from "../../../middleware/requireApiAuth";
import * as cartController from "../controllers/cart.controller";

const cartRouter = Router();

cartRouter.use(requireApiAuth);

cartRouter.get("/", asyncHandler(cartController.getCart));
cartRouter.post("/items", asyncHandler(cartController.addItem));
cartRouter.patch("/items/:id", asyncHandler(cartController.updateItem));
cartRouter.delete("/items/:id", asyncHandler(cartController.removeItem));
cartRouter.post("/sync", asyncHandler(cartController.syncGuestCart));

export { cartRouter };
