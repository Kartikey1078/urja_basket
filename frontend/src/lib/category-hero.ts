import { getShopCategoryBySlug } from "./shop-categories";

/** Full-width hero banners for specific slugs (exact assets + dimensions). */
const HERO_BY_SLUG: Record<
  string,
  { src: string; width: number; height: number; alt: string }
> = {
  "fresh-fruits": {
    src: "/fruits/image.png",
    width: 1664,
    height: 612,
    alt: "",
  },
  "dry-fruits": {
    src: "/dryFruit/image.png",
    width: 1672,
    height: 941,
    alt: "",
  },
};

/**
 * Hero for category listing pages.
 * 1) Explicit `HERO_BY_SLUG` when we have a wide banner asset.
 * 2) Else the same `image` as in `SHOP_CATEGORIES` (local or remote).
 * 3) Else a neutral default.
 */
export function getCategoryHero(slug: string) {
  const explicit = HERO_BY_SLUG[slug];
  if (explicit) return explicit;

  const shop = getShopCategoryBySlug(slug);
  if (shop?.image) {
    const remote = shop.image.startsWith("http");
    return {
      src: shop.image,
      width: remote ? 1600 : 900,
      height: remote ? 900 : 900,
      alt: "",
    };
  }

  return {
    src: "/home/fruits.png",
    width: 1200,
    height: 600,
    alt: "",
  };
}

/** Full-width hero for the bestsellers listing page. */
export function getBestsellersHero() {
  return getCategoryHero("fresh-fruits");
}
