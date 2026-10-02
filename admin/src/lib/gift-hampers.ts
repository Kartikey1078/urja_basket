export const GIFT_HAMPER_CATEGORY_SLUG = "gift-hampers";

export function findGiftHamperCategoryId(
  categories: Array<{ id: number; slug: string }> | undefined
): number | null {
  const row = categories?.find((c) => c.slug === GIFT_HAMPER_CATEGORY_SLUG);
  return row?.id ?? null;
}
