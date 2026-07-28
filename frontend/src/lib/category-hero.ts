/** Full-width hero banners for category listing pages (`/categories/{slug}`). */
export type CategoryHero = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

/**
 * Category page banners only — separate from home/category-grid thumbnails in
 * `SHOP_CATEGORIES`. Add entries here when wide banner assets are ready.
 */
const HERO_BY_SLUG: Record<string, CategoryHero> = {};

/**
 * Hero for `/categories/{slug}` pages. Returns `null` when no banner is configured.
 */
export function getCategoryHero(slug: string): CategoryHero | null {
  return HERO_BY_SLUG[slug] ?? null;
}

/** Optional hero for the bestsellers listing page. */
export function getBestsellersHero(): CategoryHero | null {
  return HERO_BY_SLUG["bestsellers"] ?? null;
}
