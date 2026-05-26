import { HttpError } from "../../../errors/httpError";
import * as categoryRepo from "../repositories/category.repository";

export async function listCategories() {
  return categoryRepo.findAllCategories();
}

export async function getCategoryBySlug(slug: string) {
  const row = await categoryRepo.findCategoryBySlug(slug);
  if (!row) {
    throw new HttpError(404, "Category not found");
  }
  return row;
}
