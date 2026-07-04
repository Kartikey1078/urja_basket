import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../database/pool";
import { parseNutritionTags } from "../../lib/nutrition-tags";

export type NutritionTagCatalogRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export type NutritionTagOption = {
  name: string;
  slug: string;
  imageUrl: string | null;
};

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listNutritionTagCatalog(): Promise<NutritionTagCatalogRow[]> {
  const [rows] = await pool.query<NutritionTagCatalogRow[]>(
    `SELECT id, name, slug, image_url, sort_order, created_at, updated_at
     FROM nutrition_tag_catalog
     ORDER BY sort_order ASC, name ASC`
  );
  return rows;
}

export async function findNutritionTagById(id: number): Promise<NutritionTagCatalogRow | null> {
  const [rows] = await pool.query<NutritionTagCatalogRow[]>(
    `SELECT id, name, slug, image_url, sort_order, created_at, updated_at
     FROM nutrition_tag_catalog WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function insertNutritionTag(input: {
  name: string;
  slug?: string;
  image_url?: string | null;
  sort_order?: number;
}): Promise<number> {
  const name = input.name.trim();
  const slug = (input.slug?.trim() || slugifyName(name)) || slugifyName(name);
  const [r] = await pool.execute<ResultSetHeader>(
    `INSERT INTO nutrition_tag_catalog (name, slug, image_url, sort_order)
     VALUES (:name, :slug, :image_url, :sort_order)`,
    {
      name,
      slug,
      image_url: input.image_url?.trim() || null,
      sort_order: input.sort_order ?? 0,
    }
  );
  return r.insertId;
}

export async function updateNutritionTag(
  id: number,
  input: Partial<{
    name: string;
    slug: string;
    image_url: string | null;
    sort_order: number;
  }>
): Promise<boolean> {
  const fields: string[] = [];
  const params: Record<string, string | number | null> = { id };
  if (input.name !== undefined) {
    fields.push("name = :name");
    params.name = input.name.trim();
  }
  if (input.slug !== undefined) {
    fields.push("slug = :slug");
    params.slug = input.slug.trim();
  }
  if (input.image_url !== undefined) {
    fields.push("image_url = :image_url");
    params.image_url = input.image_url?.trim() || null;
  }
  if (input.sort_order !== undefined) {
    fields.push("sort_order = :sort_order");
    params.sort_order = input.sort_order;
  }
  if (fields.length === 0) return true;
  const [r] = await pool.execute<ResultSetHeader>(
    `UPDATE nutrition_tag_catalog SET ${fields.join(", ")} WHERE id = :id`,
    params
  );
  return r.affectedRows > 0;
}

export async function deleteNutritionTag(id: number): Promise<void> {
  await pool.execute(`DELETE FROM nutrition_tag_catalog WHERE id = :id`, { id });
}

async function distinctTagNamesFromProducts(options?: {
  categorySlug?: string;
  onlyBestSeller?: boolean;
}): Promise<string[]> {
  const conditions: string[] = ["p.nutrition_tags IS NOT NULL"];
  const params: Record<string, string | number> = {};

  if (options?.categorySlug) {
    conditions.push("c.slug = :categorySlug");
    params.categorySlug = options.categorySlug;
  }
  if (options?.onlyBestSeller) {
    conditions.push("p.is_best_seller = 1");
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

export async function listNutritionFilterOptions(options?: {
  categorySlug?: string;
  onlyBestSeller?: boolean;
}): Promise<NutritionTagOption[]> {
  const [tagNames, catalog] = await Promise.all([
    distinctTagNamesFromProducts(options),
    listNutritionTagCatalog(),
  ]);

  if (tagNames.length === 0) return [];

  const catalogByName = new Map(catalog.map((row) => [row.name.toLowerCase(), row]));

  return tagNames.map((name) => {
    const row = catalogByName.get(name.toLowerCase());
    return {
      name,
      slug: row?.slug ?? slugifyName(name),
      imageUrl: row?.image_url ?? null,
    };
  });
}
