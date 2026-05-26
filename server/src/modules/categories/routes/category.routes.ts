import { Router } from "express";
import { asyncHandler } from "../../../middleware/asyncHandler";
import * as categoryController from "../controllers/category.controller";

const router = Router();

router.get("/", asyncHandler(categoryController.list));
router.get("/:slug", asyncHandler(categoryController.getBySlug));

export { router as categoryRouter };
