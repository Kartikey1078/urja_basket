import type { Request, Response } from "express";
import { HttpError } from "../../errors/httpError";
import * as categoryRepo from "../categories/repositories/category.repository";
import * as productRepo from "../products/repositories/product.repository";
import * as reviewRepo from "../reviews/repositories/review.repository";

function isMysqlDuplicate(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { errno?: number }).errno === 1062;
}

function isMysqlFk(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { errno?: number }).errno === 1451;
}

function paramStr(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parseId(param: string | undefined, label: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return id;
}

/** --- Categories --- */
export async function adminListCategories(_req: Request, res: Response) {
  const data = await categoryRepo.findAllCategories();
  res.json({ data });
}

export async function adminGetCategory(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "category id");
  const row = await categoryRepo.findCategoryById(id);
  if (!row) throw new HttpError(404, "Category not found");
  res.json({ data: row });
}

export async function adminCreateCategory(req: Request, res: Response) {
  const { name, slug, image } = req.body as Record<string, unknown>;
  if (typeof name !== "string" || typeof slug !== "string") {
    throw new HttpError(400, "name and slug are required strings");
  }
  const imageVal = image === undefined || image === null ? null : String(image);
  try {
    const insertId = await categoryRepo.insertCategory({
      name: name.trim(),
      slug: slug.trim(),
      image: imageVal,
    });
    res.status(201).json({ data: { id: insertId } });
  } catch (e) {
    if (isMysqlDuplicate(e)) throw new HttpError(409, "Duplicate slug or id");
    throw e;
  }
}

export async function adminUpdateCategory(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "category id");
  const body = req.body as Record<string, unknown>;
  const patch: { name?: string; slug?: string; image?: string | null } = {};
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.slug !== undefined) patch.slug = String(body.slug);
  if (body.image !== undefined) patch.image = body.image === null ? null : String(body.image);
  try {
    const ok = await categoryRepo.updateCategory(id, patch);
    if (!ok) throw new HttpError(404, "Category not found");
    res.json({ data: { ok: true } });
  } catch (e) {
    if (isMysqlDuplicate(e)) throw new HttpError(409, "Duplicate slug");
    throw e;
  }
}

export async function adminDeleteCategory(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "category id");
  try {
    await categoryRepo.deleteCategory(id);
    res.status(204).send();
  } catch (e) {
    if (isMysqlFk(e)) {
      throw new HttpError(409, "Cannot delete category: products still reference it");
    }
    throw e;
  }
}

/** --- Products --- */
export async function adminListProducts(_req: Request, res: Response) {
  const data = await productRepo.findAllProductsAdmin();
  res.json({ data });
}

export async function adminGetProduct(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "product id");
  const row = await productRepo.findProductById(id);
  if (!row) throw new HttpError(404, "Product not found");
  res.json({ data: row });
}

export async function adminCreateProduct(req: Request, res: Response) {
  const b = req.body as Record<string, unknown>;
  if (typeof b.name !== "string" || typeof b.slug !== "string") {
    throw new HttpError(400, "name and slug are required");
  }
  const categoryId = Number(b.category_id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new HttpError(400, "category_id must be a positive integer");
  }
  try {
    const insertId = await productRepo.insertProduct({
      name: b.name.trim(),
      slug: b.slug.trim(),
      short_description:
        b.short_description === undefined ? null : b.short_description === null ? null : String(b.short_description),
      full_description:
        b.full_description === undefined ? null : b.full_description === null ? null : String(b.full_description),
      category_id: categoryId,
      main_image:
        b.main_image === undefined ? null : b.main_image === null ? null : String(b.main_image),
      stock: b.stock === undefined ? 0 : Number(b.stock),
      is_featured: Boolean(b.is_featured),
      is_best_seller: Boolean(b.is_best_seller),
      is_organic: Boolean(b.is_organic),
    });
    res.status(201).json({ data: { id: insertId } });
  } catch (e) {
    if (isMysqlDuplicate(e)) throw new HttpError(409, "Duplicate slug or SKU conflict");
    throw e;
  }
}

export async function adminUpdateProduct(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "product id");
  const b = req.body as Record<string, unknown>;
  const patch: Parameters<typeof productRepo.updateProduct>[1] = {};
  if (b.name !== undefined) patch.name = String(b.name);
  if (b.slug !== undefined) patch.slug = String(b.slug);
  if (b.short_description !== undefined) {
    patch.short_description = b.short_description === null ? null : String(b.short_description);
  }
  if (b.full_description !== undefined) {
    patch.full_description = b.full_description === null ? null : String(b.full_description);
  }
  if (b.category_id !== undefined) {
    const cid = Number(b.category_id);
    if (!Number.isInteger(cid) || cid <= 0) throw new HttpError(400, "Invalid category_id");
    patch.category_id = cid;
  }
  if (b.main_image !== undefined) {
    patch.main_image = b.main_image === null ? null : String(b.main_image);
  }
  if (b.stock !== undefined) patch.stock = Number(b.stock);
  if (b.is_featured !== undefined) patch.is_featured = Boolean(b.is_featured);
  if (b.is_best_seller !== undefined) patch.is_best_seller = Boolean(b.is_best_seller);
  if (b.is_organic !== undefined) patch.is_organic = Boolean(b.is_organic);
  try {
    const ok = await productRepo.updateProduct(id, patch);
    if (!ok) throw new HttpError(404, "Product not found");
    res.json({ data: { ok: true } });
  } catch (e) {
    if (isMysqlDuplicate(e)) throw new HttpError(409, "Duplicate slug");
    throw e;
  }
}

export async function adminDeleteProduct(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "product id");
  await productRepo.deleteProduct(id);
  res.status(204).send();
}

/** --- Variants --- */
export async function adminListVariants(req: Request, res: Response) {
  const productId = parseId(paramStr(req.params.productId), "product id");
  const exists = await productRepo.findProductById(productId);
  if (!exists) throw new HttpError(404, "Product not found");
  const data = await productRepo.findVariantsByProductId(productId);
  res.json({ data });
}

export async function adminCreateVariant(req: Request, res: Response) {
  const productId = parseId(paramStr(req.params.productId), "product id");
  const parent = await productRepo.findProductById(productId);
  if (!parent) throw new HttpError(404, "Product not found");
  const b = req.body as Record<string, unknown>;
  if (typeof b.weight !== "string" || typeof b.sku !== "string") {
    throw new HttpError(400, "weight and sku are required");
  }
  const price = Number(b.price);
  if (!Number.isFinite(price)) throw new HttpError(400, "price is required");
  try {
    const insertId = await productRepo.insertVariant({
      product_id: productId,
      weight: b.weight.trim(),
      price,
      original_price: b.original_price === undefined || b.original_price === null ? null : Number(b.original_price),
      discount_percentage:
        b.discount_percentage === undefined ? 0 : Number(b.discount_percentage),
      stock: b.stock === undefined ? 0 : Number(b.stock),
      sku: b.sku.trim(),
    });
    res.status(201).json({ data: { id: insertId } });
  } catch (e) {
    if (isMysqlDuplicate(e)) throw new HttpError(409, "Duplicate SKU");
    throw e;
  }
}

export async function adminUpdateVariant(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "variant id");
  const b = req.body as Record<string, unknown>;
  const patch: Parameters<typeof productRepo.updateVariant>[1] = {};
  if (b.weight !== undefined) patch.weight = String(b.weight);
  if (b.price !== undefined) patch.price = Number(b.price);
  if (b.original_price !== undefined) {
    patch.original_price = b.original_price === null ? null : Number(b.original_price);
  }
  if (b.discount_percentage !== undefined) patch.discount_percentage = Number(b.discount_percentage);
  if (b.stock !== undefined) patch.stock = Number(b.stock);
  if (b.sku !== undefined) patch.sku = String(b.sku);
  try {
    const ok = await productRepo.updateVariant(id, patch);
    if (!ok) throw new HttpError(404, "Variant not found");
    res.json({ data: { ok: true } });
  } catch (e) {
    if (isMysqlDuplicate(e)) throw new HttpError(409, "Duplicate SKU");
    throw e;
  }
}

export async function adminDeleteVariant(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "variant id");
  await productRepo.deleteVariant(id);
  res.status(204).send();
}

/** --- Reviews --- */
export async function adminListReviews(req: Request, res: Response) {
  const q = req.query.productId;
  let productId: number | undefined;
  if (typeof q === "string" && q.trim() !== "") {
    productId = parseId(q.trim(), "productId query");
  }
  const data = await reviewRepo.findReviewsAdmin(productId);
  res.json({ data });
}

export async function adminUpdateReview(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "review id");
  const b = req.body as Record<string, unknown>;
  const patch: { rating?: number; comment?: string | null } = {};
  if (b.rating !== undefined) {
    const r = Number(b.rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) throw new HttpError(400, "rating must be 1–5");
    patch.rating = r;
  }
  if (b.comment !== undefined) {
    patch.comment = b.comment === null ? null : String(b.comment);
  }
  const row = await reviewRepo.findReviewById(id);
  if (!row) throw new HttpError(404, "Review not found");
  const ok = await reviewRepo.updateReview(id, patch);
  if (!ok) throw new HttpError(404, "Review not found");
  await reviewRepo.refreshProductReviewStats(row.product_id);
  res.json({ data: { ok: true } });
}

export async function adminDeleteReview(req: Request, res: Response) {
  const id = parseId(paramStr(req.params.id), "review id");
  const productId = await reviewRepo.deleteReviewById(id);
  if (productId === null) throw new HttpError(404, "Review not found");
  await reviewRepo.refreshProductReviewStats(productId);
  res.status(204).send();
}
