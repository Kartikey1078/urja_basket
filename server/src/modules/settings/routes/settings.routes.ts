import { Router } from "express";
import { asyncHandler } from "../../../middleware/asyncHandler";
import * as settingsController from "../settings.controller";

const r = Router();

r.get("/", asyncHandler(settingsController.getPublicSettings));

export { r as settingsRouter };
