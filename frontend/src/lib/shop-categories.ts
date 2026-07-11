/**
 * Shop nav: `slug` matches backend `categories.slug`; `href` is always `/categories/{slug}`.
 */
export const SHOP_CATEGORIES = [
  {
    slug: "fresh-fruits",
    label: "Fruits",
    image: "/home/fruits.png",
    href: "/categories/fresh-fruits",
  },
  {
    slug: "dry-fruits",
    label: "Dry Fruits",
    image: "/home/dryfruits.png",
    href: "/categories/dry-fruits",
  },
  {
    slug: "nuts-seeds",
    label: "Nuts & Seeds",
    image: "/home/seedsandnuts.png",
    href: "/categories/nuts-seeds",
  },
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

/** Same URL shape the app uses everywhere: `/categories/{backendSlug}`. */
export function categoryPath(slug: string): string {
  return `/categories/${slug}`;
}

export function getShopCategoryBySlug(slug: string): ShopCategory | undefined {
  return SHOP_CATEGORIES.find((c) => c.slug === slug);
}

export function humanizeCategorySlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
