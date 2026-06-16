import { Router } from "express";
import { asyncHandler } from "../../../middleware/asyncHandler";
import * as productController from "../controllers/product.controller";

const router = Router();

router.get("/", asyncHandler(productController.list));
router.get("/nutrition-tags", asyncHandler(productController.listNutritionTags));
router.post("/:productId/reviews", asyncHandler(productController.createReview));
router.get("/:slug", asyncHandler(productController.getBySlug));

export { router as productRouter };
