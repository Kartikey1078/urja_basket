import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../../database/pool";
import { normalizeNutritionTagsInput, parseNutritionTags } from "../../../lib/nutrition-tags";
import { getSiteSettings } from "../../settings/settings.service";

export type ProductListRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  category_id: number;
  main_image: string | null;
  stock: number;
  average_rating: string;
  total_reviews: number;
  is_featured: number;
  is_best_seller: number;
  is_organic: number;
  nutrition_tags: unknown;
  created_at: Date;
  updated_at: Date;
  category_name: string;
  category_slug: string;
  min_price: string | null;
  card_weight: string | null;
  card_price: string | null;
  card_original_price: string | null;
};

export const PRODUCT_SORT_VALUES = ["price_asc", "price_desc"] as const;

export type ProductSort = (typeof PRODUCT_SORT_VALUES)[number];

export function isProductSort(value: string): value is ProductSort {
  return (PRODUCT_SORT_VALUES as readonly string[]).includes(value);
}

function orderClauseForSort(sort?: ProductSort): string {
  switch (sort) {
    case "price_asc":
      return "ORDER BY min_price ASC, p.name ASC";
    case "price_desc":
      return "ORDER BY min_price DESC, p.name ASC";
    default:
      return "ORDER BY p.is_featured DESC, p.name ASC";
  }
}

export type ProductCardFilters = {
  categorySlug?: string;
  onlyBestSeller?: boolean;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  onSale?: boolean;
  organic?: boolean;
  featured?: boolean;
  inStock?: boolean;
  nutritionTags?: string[];
};

const MIN_PRICE_SQL = `(
  SELECT MIN(pv.price)
  FROM product_variants pv
  WHERE pv.product_id = p.id
)`;

export async function findAllProductCards(
  filters: ProductCardFilters = {}
): Promise<ProductListRow[]> {
  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (filters.categorySlug) {
    conditions.push("c.slug = :categorySlug");
    params.categorySlug = filters.categorySlug;
  }
  if (filters.onlyBestSeller) {
    conditions.push("p.is_best_seller = 1");
  }
  if (filters.minPrice !== undefined && Number.isFinite(filters.minPrice)) {
    conditions.push(`${MIN_PRICE_SQL} >= :minPrice`);
    params.minPrice = filters.minPrice;
  }
  if (filters.maxPrice !== undefined && Number.isFinite(filters.maxPrice)) {
    conditions.push(`${MIN_PRICE_SQL} <= :maxPrice`);
    params.maxPrice = filters.maxPrice;
  }
  if (filters.minRating !== undefined && Number.isFinite(filters.minRating)) {
    conditions.push("p.average_rating >= :minRating");
    params.minRating = filters.minRating;
  }
  if (filters.onSale) {
    conditions.push(`EXISTS (
      SELECT 1 FROM product_variants pv_sale
      WHERE pv_sale.product_id = p.id
        AND pv_sale.original_price IS NOT NULL
        AND pv_sale.original_price > pv_sale.price
    )`);
  }
  if (filters.organic) {
    conditions.push("p.is_organic = 1");
  }
  if (filters.featured) {
    conditions.push("p.is_featured = 1");
  }
  if (filters.inStock) {
    conditions.push(`(
      p.stock > 0
      OR EXISTS (
        SELECT 1 FROM product_variants pv_stock
        WHERE pv_stock.product_id = p.id AND pv_stock.stock > 0
      )
    )`);
  }
  if (filters.nutritionTags && filters.nutritionTags.length > 0) {
    const tagConditions = filters.nutritionTags.map(
      (_, index) =>
        `JSON_CONTAINS(COALESCE(p.nutrition_tags, JSON_ARRAY()), JSON_QUOTE(:nutritionTag${index}))`
    );
    conditions.push(`(${tagConditions.join(" OR ")})`);
    filters.nutritionTags.forEach((tag, index) => {
      params[`nutritionTag${index}`] = tag;
    });
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = orderClauseForSort(filters.sort);

  const [rows] = await pool.query<ProductListRow[]>(
    `SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.full_description,
        p.category_id,
        p.main_image,
        p.stock,
        p.average_rating,
        p.total_reviews,
        p.is_featured,
        p.is_best_seller,
        p.is_organic,
        p.nutrition_tags,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        (
          SELECT MIN(pv.price)
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ) AS min_price,
        (
          SELECT pv.weight
          FROM product_variants pv
          WHERE pv.product_id = p.id
          ORDER BY pv.price ASC, pv.id ASC
          LIMIT 1
        ) AS card_weight,
        (
          SELECT pv.price
          FROM product_variants pv
          WHERE pv.product_id = p.id
          ORDER BY pv.price ASC, pv.id ASC
          LIMIT 1
        ) AS card_price,
        (
          SELECT pv.original_price
          FROM product_variants pv
          WHERE pv.product_id = p.id
          ORDER BY pv.price ASC, pv.id ASC
          LIMIT 1
        ) AS card_original_price
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     ${whereClause}
     ${orderClause}`,
    params
  );
  return rows;
}

export type ProductVariantRow = RowDataPacket & {
  id: number;
  product_id: number;
  weight: string;
  price: string;
  original_price: string | null;
  discount_percentage: string;
  stock: number;
  sku: string;
  created_at: Date;
  updated_at: Date;
};

export type ReviewRow = RowDataPacket & {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  created_at: Date;
};

export async function findProductBySlug(slug: string): Promise<ProductListRow | null> {
  const [rows] = await pool.query<ProductListRow[]>(
    `SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.full_description,
        p.category_id,
        p.main_image,
        p.stock,
        p.average_rating,
        p.total_reviews,
        p.is_featured,
        p.is_best_seller,
        p.is_organic,
        p.nutrition_tags,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        (
          SELECT MIN(pv.price)
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ) AS min_price,
        (
          SELECT pv.weight
          FROM product_variants pv
          WHERE pv.product_id = p.id
          ORDER BY pv.price ASC, pv.id ASC
          LIMIT 1
        ) AS card_weight,
        (
          SELECT pv.price
          FROM product_variants pv
          WHERE pv.product_id = p.id
          ORDER BY pv.price ASC, pv.id ASC
          LIMIT 1
        ) AS card_price,
        (
          SELECT pv.original_price
          FROM product_variants pv
          WHERE pv.product_id = p.id
          ORDER BY pv.price ASC, pv.id ASC
          LIMIT 1
        ) AS card_original_price
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.slug = :slug
     LIMIT 1`,
    { slug }
  );
  return rows[0] ?? null;
}

export async function findVariantsByProductId(productId: number): Promise<ProductVariantRow[]> {
  const [rows] = await pool.query<ProductVariantRow[]>(
    `SELECT id, product_id, weight, price, original_price, discount_percentage, stock, sku, created_at, updated_at
     FROM product_variants
     WHERE product_id = :productId
     ORDER BY price ASC`,
    { productId }
  );
  return rows;
}

export async function findReviewsByProductId(productId: number): Promise<ReviewRow[]> {
  const [rows] = await pool.query<ReviewRow[]>(
    `SELECT id, user_id, product_id, rating, comment, created_at
     FROM reviews
     WHERE product_id = :productId
     ORDER BY created_at DESC`,
    { productId }
  );
  return rows;
}

export async function findProductIdByNumericId(id: number): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM products WHERE id = :id LIMIT 1`,
    { id }
  );
  const row = rows[0] as { id: number } | undefined;
  return row?.id ?? null;
}

/** Flat `products` row (admin). */
export type ProductAdminRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  category_id: number;
  main_image: string | null;
  stock: number;
  average_rating: string;
  total_reviews: number;
  is_featured: number;
  is_best_seller: number;
  is_organic: number;
  nutrition_tags: unknown;
  created_at: Date;
  updated_at: Date;
};

export type ProductAdminListRow = ProductAdminRow & {
  category_name: string;
  category_slug: string;
};

export type AdminProductStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type AdminProductListFilters = {
  q?: string;
  categoryId?: number;
  stockStatus?: AdminProductStockStatus;
  sort?: "newest" | "name_asc" | "name_desc" | "stock_asc" | "stock_desc" | "updated";
  page?: number;
  limit?: number;
};

const ADMIN_PRODUCT_SELECT = `SELECT
        p.id, p.name, p.slug, p.short_description, p.full_description, p.category_id,
        p.main_image, p.stock, p.average_rating, p.total_reviews,
        p.is_featured, p.is_best_seller, p.is_organic, p.nutrition_tags,
        p.created_at, p.updated_at,
        c.name AS category_name, c.slug AS category_slug`;

const ADMIN_PRODUCT_FROM = `FROM products p
     INNER JOIN categories c ON c.id = p.category_id`;

async function buildAdminProductListWhere(filters?: AdminProductListFilters): Promise<{
  where: string;
  params: (string | number)[];
}> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters?.q?.trim()) {
    conditions.push("(p.name LIKE ? OR p.slug LIKE ? OR c.name LIKE ?)");
    const term = `%${filters.q.trim()}%`;
    params.push(term, term, term);
  }
  if (filters?.categoryId && filters.categoryId > 0) {
    conditions.push("p.category_id = ?");
    params.push(filters.categoryId);
  }
  if (filters?.stockStatus) {
    const { lowStockThreshold } = await getSiteSettings();
    if (filters.stockStatus === "out_of_stock") {
      conditions.push("p.stock = 0");
    } else if (filters.stockStatus === "low_stock") {
      conditions.push("p.stock > 0 AND p.stock <= ?");
      params.push(lowStockThreshold);
    } else {
      conditions.push("p.stock > ?");
      params.push(lowStockThreshold);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, params };
}

function adminProductOrderBy(sort?: AdminProductListFilters["sort"]): string {
  switch (sort) {
    case "name_asc":
      return "p.name ASC";
    case "name_desc":
      return "p.name DESC";
    case "stock_asc":
      return "p.stock ASC, p.name ASC";
    case "stock_desc":
      return "p.stock DESC, p.name ASC";
    case "updated":
      return "p.updated_at DESC";
    case "newest":
    default:
      return "p.id DESC";
  }
}

export async function listProductsAdminPaginated(filters?: AdminProductListFilters): Promise<{
  items: ProductAdminListRow[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = Math.max(1, filters?.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));
  const offset = (page - 1) * limit;
  const { where, params } = await buildAdminProductListWhere(filters);
  const orderBy = adminProductOrderBy(filters?.sort);

  const [countRows] = await pool.query<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total ${ADMIN_PRODUCT_FROM} ${where}`,
    params
  );
  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await pool.query<ProductAdminListRow[]>(
    `${ADMIN_PRODUCT_SELECT} ${ADMIN_PRODUCT_FROM} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { items: rows, total, page, limit };
}

/** @deprecated Use listProductsAdminPaginated */
export async function findAllProductsAdmin(): Promise<ProductAdminListRow[]> {
  const { items } = await listProductsAdminPaginated({ page: 1, limit: 10_000 });
  return items;
}

export async function findProductById(id: number): Promise<ProductAdminRow | null> {
  const [rows] = await pool.query<ProductAdminRow[]>(
    `SELECT id, name, slug, short_description, full_description, category_id, main_image,
            stock, average_rating, total_reviews, is_featured, is_best_seller, is_organic,
            nutrition_tags, created_at, updated_at
     FROM products WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function insertProduct(input: {
  name: string;
  slug: string;
  short_description?: string | null;
  full_description?: string | null;
  category_id: number;
  main_image?: string | null;
  stock?: number;
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_organic?: boolean;
  nutrition_tags?: string[];
}): Promise<number> {
  const nutritionTags = normalizeNutritionTagsInput(input.nutrition_tags);
  const [r] = await pool.execute<ResultSetHeader>(
    `INSERT INTO products (
        name, slug, short_description, full_description, category_id, main_image,
        stock, average_rating, total_reviews, is_featured, is_best_seller, is_organic,
        nutrition_tags
     ) VALUES (
        :name, :slug, :short_description, :full_description, :category_id, :main_image,
        :stock, 0.00, 0, :is_featured, :is_best_seller, :is_organic, :nutrition_tags
     )`,
    {
      name: input.name,
      slug: input.slug,
      short_description: input.short_description ?? null,
      full_description: input.full_description ?? null,
      category_id: input.category_id,
      main_image: input.main_image ?? null,
      stock: input.stock ?? 0,
      is_featured: input.is_featured ? 1 : 0,
      is_best_seller: input.is_best_seller ? 1 : 0,
      is_organic: input.is_organic ? 1 : 0,
      nutrition_tags: nutritionTags.length > 0 ? JSON.stringify(nutritionTags) : null,
    }
  );
  return r.insertId;
}

export async function updateProduct(
  id: number,
  input: Partial<{
    name: string;
    slug: string;
    short_description: string | null;
    full_description: string | null;
    category_id: number;
    main_image: string | null;
    stock: number;
    is_featured: boolean;
    is_best_seller: boolean;
    is_organic: boolean;
    nutrition_tags: string[] | null;
  }>
): Promise<boolean> {
  const fields: string[] = [];
  const params: Record<string, string | number | null> = { id };
  const map: [keyof typeof input, string][] = [
    ["name", "name"],
    ["slug", "slug"],
    ["short_description", "short_description"],
    ["full_description", "full_description"],
    ["category_id", "category_id"],
    ["main_image", "main_image"],
    ["stock", "stock"],
  ];
  for (const [k, col] of map) {
    if (input[k] !== undefined) {
      fields.push(`${col} = :${col}`);
      params[col] = input[k] as string | number | null;
    }
  }
  if (input.is_featured !== undefined) {
    fields.push("is_featured = :is_featured");
    params.is_featured = input.is_featured ? 1 : 0;
  }
  if (input.is_best_seller !== undefined) {
    fields.push("is_best_seller = :is_best_seller");
    params.is_best_seller = input.is_best_seller ? 1 : 0;
  }
  if (input.is_organic !== undefined) {
    fields.push("is_organic = :is_organic");
    params.is_organic = input.is_organic ? 1 : 0;
  }
  if (input.nutrition_tags !== undefined) {
    const tags = input.nutrition_tags === null ? [] : normalizeNutritionTagsInput(input.nutrition_tags);
    fields.push("nutrition_tags = :nutrition_tags");
    params.nutrition_tags = tags.length > 0 ? JSON.stringify(tags) : null;
  }
  if (fields.length === 0) return true;
  const [r] = await pool.execute<ResultSetHeader>(
    `UPDATE products SET ${fields.join(", ")} WHERE id = :id`,
    params
  );
  return r.affectedRows > 0;
}

export async function deleteProduct(id: number): Promise<void> {
  await pool.execute(`DELETE FROM products WHERE id = :id`, { id });
}

export async function findVariantById(id: number): Promise<ProductVariantRow | null> {
  const [rows] = await pool.query<ProductVariantRow[]>(
    `SELECT id, product_id, weight, price, original_price, discount_percentage, stock, sku, created_at, updated_at
     FROM product_variants WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function insertVariant(input: {
  product_id: number;
  weight: string;
  price: number;
  original_price?: number | null;
  discount_percentage?: number;
  stock?: number;
  sku: string;
}): Promise<number> {
  const [r] = await pool.execute<ResultSetHeader>(
    `INSERT INTO product_variants (product_id, weight, price, original_price, discount_percentage, stock, sku)
     VALUES (:product_id, :weight, :price, :original_price, :discount_percentage, :stock, :sku)`,
    {
      product_id: input.product_id,
      weight: input.weight,
      price: input.price,
      original_price: input.original_price ?? null,
      discount_percentage: input.discount_percentage ?? 0,
      stock: input.stock ?? 0,
      sku: input.sku,
    }
  );
  return r.insertId;
}

export async function updateVariant(
  id: number,
  input: Partial<{
    weight: string;
    price: number;
    original_price: number | null;
    discount_percentage: number;
    stock: number;
    sku: string;
  }>
): Promise<boolean> {
  const fields: string[] = [];
  const params: Record<string, string | number | null> = { id };
  if (input.weight !== undefined) {
    fields.push("weight = :weight");
    params.weight = input.weight;
  }
  if (input.price !== undefined) {
    fields.push("price = :price");
    params.price = input.price;
  }
  if (input.original_price !== undefined) {
    fields.push("original_price = :original_price");
    params.original_price = input.original_price;
  }
  if (input.discount_percentage !== undefined) {
    fields.push("discount_percentage = :discount_percentage");
    params.discount_percentage = input.discount_percentage;
  }
  if (input.stock !== undefined) {
    fields.push("stock = :stock");
    params.stock = input.stock;
  }
  if (input.sku !== undefined) {
    fields.push("sku = :sku");
    params.sku = input.sku;
  }
  if (fields.length === 0) return true;
  const [r] = await pool.execute<ResultSetHeader>(
    `UPDATE product_variants SET ${fields.join(", ")} WHERE id = :id`,
    params
  );
  return r.affectedRows > 0;
}

export async function deleteVariant(id: number): Promise<void> {
  await pool.execute(`DELETE FROM product_variants WHERE id = :id`, { id });
}

export async function findDistinctNutritionTags(categorySlug?: string): Promise<string[]> {
  const conditions: string[] = ["p.nutrition_tags IS NOT NULL"];
  const params: Record<string, string> = {};

  if (categorySlug) {
    conditions.push("c.slug = :categorySlug");
    params.categorySlug = categorySlug;
  }

  const [rows] = await pool.query<(RowDataPacket & { nutrition_tags: unknown })[]>(
    `SELECT p.nutrition_tags
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE ${conditions.join(" AND ")}`,
    params
  );

  const seen = new Set<string>();
  const tags: string[] = [];
  for (const row of rows) {
    for (const tag of parseNutritionTags(row.nutrition_tags)) {
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags.sort((a, b) => a.localeCompare(b));
}

export { parseNutritionTags };
