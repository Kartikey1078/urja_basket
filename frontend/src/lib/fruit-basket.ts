export const FRUIT_BASKET_CATEGORY_SLUG = "fruit-basket";
export const GIFT_HAMPER_CATEGORY_SLUG = "gift-hampers";

export function isFruitBasketCategory(slug: string | null | undefined): boolean {
  return slug === FRUIT_BASKET_CATEGORY_SLUG;
}

export function isGiftHamperCategory(slug: string | null | undefined): boolean {
  return slug === GIFT_HAMPER_CATEGORY_SLUG;
}

/** Category pages that use large premium hamper/basket cards. */
export function isHamperListingCategory(slug: string | null | undefined): boolean {
  return isFruitBasketCategory(slug) || isGiftHamperCategory(slug);
}
