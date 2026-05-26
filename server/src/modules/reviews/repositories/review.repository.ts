import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { ReviewRow } from "../../products/repositories/product.repository";
import { pool } from "../../../database/pool";

export async function insertReview(input: {
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
}): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO reviews (user_id, product_id, rating, comment)
     VALUES (:userId, :productId, :rating, :comment)`,
    {
      userId: input.userId,
      productId: input.productId,
      rating: input.rating,
      comment: input.comment,
    }
  );
  return result.insertId;
}

export async function refreshProductReviewStats(productId: number): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
        COALESCE(AVG(rating), 0) AS avg_rating,
        COUNT(*) AS cnt
     FROM reviews
     WHERE product_id = :productId`,
    { productId }
  );
  const row = rows[0] as { avg_rating: string; cnt: number } | undefined;
  if (!row) return;

  await pool.execute(
    `UPDATE products
     SET average_rating = :avgRating, total_reviews = :total
     WHERE id = :productId`,
    {
      avgRating: Number(row.avg_rating).toFixed(2),
      total: row.cnt,
      productId,
    }
  );
}

export async function findReviewsAdmin(productId?: number): Promise<ReviewRow[]> {
  if (productId !== undefined && Number.isFinite(productId)) {
    const [rows] = await pool.query<ReviewRow[]>(
      `SELECT id, user_id, product_id, rating, comment, created_at
       FROM reviews WHERE product_id = :productId ORDER BY created_at DESC LIMIT 500`,
      { productId }
    );
    return rows;
  }
  const [rows] = await pool.query<ReviewRow[]>(
    `SELECT id, user_id, product_id, rating, comment, created_at
     FROM reviews ORDER BY id DESC LIMIT 500`
  );
  return rows;
}

export async function findReviewById(id: number): Promise<ReviewRow | null> {
  const [rows] = await pool.query<ReviewRow[]>(
    `SELECT id, user_id, product_id, rating, comment, created_at
     FROM reviews WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function updateReview(
  id: number,
  input: { rating?: number; comment?: string | null }
): Promise<boolean> {
  const fields: string[] = [];
  const params: Record<string, string | number | null> = { id };
  if (input.rating !== undefined) {
    fields.push("rating = :rating");
    params.rating = input.rating;
  }
  if (input.comment !== undefined) {
    fields.push("comment = :comment");
    params.comment = input.comment;
  }
  if (fields.length === 0) return true;
  const [r] = await pool.execute<ResultSetHeader>(
    `UPDATE reviews SET ${fields.join(", ")} WHERE id = :id`,
    params
  );
  return r.affectedRows > 0;
}

export async function deleteReviewById(id: number): Promise<number | null> {
  const row = await findReviewById(id);
  if (!row) return null;
  await pool.execute(`DELETE FROM reviews WHERE id = :id`, { id });
  return row.product_id;
}
