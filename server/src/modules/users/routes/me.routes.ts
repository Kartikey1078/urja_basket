import { Router } from "express";

import { asyncHandler } from "../../../middleware/asyncHandler";
import { requireApiAuth } from "../../../middleware/requireApiAuth";
import * as meController from "../controllers/me.controller";

const meRouter = Router();

meRouter.get("/", requireApiAuth, asyncHandler(meController.getMe));

export { meRouter };
