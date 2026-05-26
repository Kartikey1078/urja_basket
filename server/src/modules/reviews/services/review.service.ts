import { HttpError } from "../../../errors/httpError";
import * as productRepo from "../../products/repositories/product.repository";
import * as reviewRepo from "../repositories/review.repository";

export async function createReview(input: {
  productId: number;
  userId: number;
  rating: number;
  comment: string | null;
}) {
  const exists = await productRepo.findProductIdByNumericId(input.productId);
  if (!exists) {
    throw new HttpError(404, "Product not found");
  }

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new HttpError(400, "rating must be an integer between 1 and 5");
  }

  const id = await reviewRepo.insertReview({
    userId: input.userId,
    productId: input.productId,
    rating: input.rating,
    comment: input.comment,
  });

  await reviewRepo.refreshProductReviewStats(input.productId);

  return { id };
}
