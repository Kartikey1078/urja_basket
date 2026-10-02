/**
 * Shop nav: `slug` matches backend `categories.slug`; `href` is always `/categories/{slug}`.
 */
export const SHOP_CATEGORIES = [
  {
    slug: "fresh-fruits",
    label: "Fresh Fruits",
    description: "Farm-fresh seasonal fruits — sweet, juicy & delivered fast.",
    image: "/homepagecategory/fruits.png",
    href: "/categories/fresh-fruits",
  },
  {
    slug: "dry-fruits",
    label: "Dry Fruits",
    description: "Premium almonds, dates, raisins & more — hygienically packed.",
    image: "/homepagecategory/dryfruits.png",
    href: "/categories/dry-fruits",
  },
  {
    slug: "nuts-seeds",
    label: "Nuts & Seeds",
    description: "Wholesome nuts, seeds & trail mixes for everyday snacking.",
    image: "/homepagecategory/nutsandseeds.png",
    href: "/categories/nuts-seeds",
  },
  {
    slug: "fruit-basket",
    label: "Fruit Basket",
    description: "Handpicked fruit baskets & hampers — perfect for gifting and celebrations.",
    image: "/homepagecategory/fruitbasket.png",
    href: "/categories/fruit-basket",
  },
  {
    slug: "gift-hampers",
    label: "Gift Hamper",
    description: "Premium gift hampers — fruits, dry fruits & treats beautifully packed for every occasion.",
    image: "/homepagecategory/gifthampers.png",
    href: "/categories/gift-hampers",
  },
  {
    slug: "desi-delight",
    label: "Desi Delight",
    description: "Traditional mukhwas, saunf & desi mouth fresheners — colourful, aromatic & freshly packed.",
    image: "/homepagecategory/desidelight.png",
    href: "/categories/desi-delight",
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
