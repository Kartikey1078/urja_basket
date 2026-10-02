/** Backend category slug for curated fruit basket / hamper products. */
export const FRUIT_BASKET_CATEGORY_SLUG = "fruit-basket";

export function isFruitBasketCategorySlug(slug: string | null | undefined): boolean {
  return slug === FRUIT_BASKET_CATEGORY_SLUG;
}
