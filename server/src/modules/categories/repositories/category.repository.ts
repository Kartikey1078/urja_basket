import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../../database/pool";

export type CategoryRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function findAllCategories(): Promise<CategoryRow[]> {
  const [rows] = await pool.query<CategoryRow[]>(
    `SELECT id, name, slug, image, created_at, updated_at
     FROM categories
     ORDER BY name ASC`
  );
  return rows;
}

export async function findCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const [rows] = await pool.query<CategoryRow[]>(
    `SELECT id, name, slug, image, created_at, updated_at
     FROM categories
     WHERE slug = :slug
     LIMIT 1`,
    { slug }
  );
  return rows[0] ?? null;
}

export async function findCategoryById(id: number): Promise<CategoryRow | null> {
  const [rows] = await pool.query<CategoryRow[]>(
    `SELECT id, name, slug, image, created_at, updated_at
     FROM categories WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function insertCategory(input: {
  name: string;
  slug: string;
  image: string | null;
}): Promise<number> {
  const [r] = await pool.execute<ResultSetHeader>(
    `INSERT INTO categories (name, slug, image) VALUES (:name, :slug, :image)`,
    { name: input.name, slug: input.slug, image: input.image }
  );
  return r.insertId;
}

export async function updateCategory(
  id: number,
  input: { name?: string; slug?: string; image?: string | null }
): Promise<boolean> {
  const fields: string[] = [];
  const params: Record<string, string | number | null> = { id };
  if (input.name !== undefined) {
    fields.push("name = :name");
    params.name = input.name;
  }
  if (input.slug !== undefined) {
    fields.push("slug = :slug");
    params.slug = input.slug;
  }
  if (input.image !== undefined) {
    fields.push("image = :image");
    params.image = input.image;
  }
  if (fields.length === 0) return true;
  const [r] = await pool.execute<ResultSetHeader>(
    `UPDATE categories SET ${fields.join(", ")} WHERE id = :id`,
    params
  );
  return r.affectedRows > 0;
}

export async function deleteCategory(id: number): Promise<void> {
  await pool.execute(`DELETE FROM categories WHERE id = :id`, { id });
}
