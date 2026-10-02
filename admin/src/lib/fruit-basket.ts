export const FRUIT_BASKET_CATEGORY_SLUG = "fruit-basket";

export function isFruitBasketCategorySlug(slug: string | null | undefined): boolean {
  return slug === FRUIT_BASKET_CATEGORY_SLUG;
}

export function isFruitBasketCategoryId(
  categoryId: number,
  categories: Array<{ id: number; slug: string }> | undefined
): boolean {
  if (!categories?.length) return false;
  const cat = categories.find((c) => c.id === categoryId);
  return isFruitBasketCategorySlug(cat?.slug);
}
