import type { Request, Response } from "express";
import { normalizeNutritionTagsInput } from "../../../lib/nutrition-tags";
import * as productService from "../services/product.service";
import * as reviewService from "../../reviews/services/review.service";
import { isProductSort } from "../repositories/product.repository";

function parseNutritionTagsQuery(req: Request): string[] {
  const raw = req.query.nutritionTags;
  if (raw == null) return [];
  const parts = Array.isArray(raw) ? raw : [raw];
  return normalizeNutritionTagsInput(
    parts.flatMap((item) =>
      typeof item === "string" ? item.split(",").map((tag) => tag.trim()) : []
    )
  );
}

export async function list(req: Request, res: Response) {
  const categorySlug =
    typeof req.query.categorySlug === "string" && req.query.categorySlug.trim() !== ""
      ? req.query.categorySlug.trim()
      : undefined;
  const bestSellerParam = req.query.bestSeller ?? req.query.bestseller;
  const onlyBestSeller =
    bestSellerParam === "1" ||
    bestSellerParam === "true" ||
    bestSellerParam === "yes";
  const sortRaw = typeof req.query.sort === "string" ? req.query.sort.trim() : "";
  const sort = isProductSort(sortRaw) ? sortRaw : undefined;

  const truthy = (v: unknown) =>
    v === "1" || v === "true" || v === "yes";

  const minPriceRaw = typeof req.query.minPrice === "string" ? Number(req.query.minPrice) : NaN;
  const maxPriceRaw = typeof req.query.maxPrice === "string" ? Number(req.query.maxPrice) : NaN;
  const minRatingRaw = typeof req.query.minRating === "string" ? Number(req.query.minRating) : NaN;

  const data = await productService.listProductCards({
    categorySlug,
    onlyBestSeller,
    sort,
    minPrice: Number.isFinite(minPriceRaw) ? minPriceRaw : undefined,
    maxPrice: Number.isFinite(maxPriceRaw) ? maxPriceRaw : undefined,
    minRating:
      Number.isFinite(minRatingRaw) && minRatingRaw >= 1 && minRatingRaw <= 5
        ? minRatingRaw
        : undefined,
    onSale: truthy(req.query.onSale),
    organic: truthy(req.query.organic),
    featured: truthy(req.query.featured),
    inStock: truthy(req.query.inStock),
    nutritionTags: parseNutritionTagsQuery(req),
  });
  res.json({ data });
}

export async function listNutritionTags(req: Request, res: Response) {
  const categorySlug =
    typeof req.query.categorySlug === "string" && req.query.categorySlug.trim() !== ""
      ? req.query.categorySlug.trim()
      : undefined;
  const data = await productService.listNutritionTags(categorySlug);
  res.json({ data });
}

export async function getBySlug(req: Request, res: Response) {
  const raw = req.params.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug) {
    res.status(400).json({ error: "slug is required" });
    return;
  }
  const data = await productService.getProductDetailBySlug(slug);
  res.json({ data });
}

export async function createReview(req: Request, res: Response) {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const { userId, rating, comment } = req.body as {
    userId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  if (typeof userId !== "number" && typeof userId !== "string") {
    res.status(400).json({ error: "userId is required (number)" });
    return;
  }
  const uid = typeof userId === "number" ? userId : Number(userId);
  if (!Number.isInteger(uid) || uid <= 0) {
    res.status(400).json({ error: "userId must be a positive integer" });
    return;
  }

  const r = typeof rating === "number" ? rating : Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    res.status(400).json({ error: "rating must be an integer between 1 and 5" });
    return;
  }

  const c =
    comment === undefined || comment === null
      ? null
      : typeof comment === "string"
        ? comment
        : String(comment);

  const result = await reviewService.createReview({
    productId,
    userId: uid,
    rating: r,
    comment: c,
  });

  res.status(201).json({ data: result });
}
