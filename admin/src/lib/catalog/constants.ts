/** Export-safe theme — premium cream & forest brochure. */
export type CatalogTheme = {
  cream: string;
  forest: string;
  forestDark: string;
  bannerBg: string;
  accentGold: string;
  rowBorder: string;
  rateBanner: string;
};

export type CatalogProduct = {
  id: number;
  name: string;
  image: string | null;
  weight: string;
  price: number;
};

export type CatalogPayload = {
  categorySlug: string;
  categoryName: string;
  generatedAt: string;
  products: CatalogProduct[];
};

export const CATALOG_PHONE = "8750024024";

export const CATALOG_LOGO_SRC = "/brand/urja-basket-logo.png";
export const CATALOG_LOGO_MARK_SRC = "/brand/urja-basket-mark.png";

export const CATALOG_SECTIONS = [
  {
    slug: "fresh-fruits",
    title: "Fresh Fruits Catalog",
    theme: {
      cream: "#faf6ee",
      forest: "#1a4d2e",
      forestDark: "#0b2b1e",
      bannerBg: "#1a4d2e",
      accentGold: "#c9a84c",
      rowBorder: "#e8dfd0",
      rateBanner: "Fresh Fruits Rate",
    },
  },
  {
    slug: "dry-fruits",
    title: "Dry Fruits Catalog",
    theme: {
      cream: "#faf6ee",
      forest: "#5c3d1e",
      forestDark: "#3d2812",
      bannerBg: "#5c3d1e",
      accentGold: "#d4a853",
      rowBorder: "#e8dfd0",
      rateBanner: "Dry Fruits Rate",
    },
  },
] as const satisfies ReadonlyArray<{
  slug: string;
  title: string;
  theme: CatalogTheme;
}>;

export type CatalogSectionSlug = (typeof CATALOG_SECTIONS)[number]["slug"];

/** Fixed WhatsApp canvas — taller 4:5+ for mobile sharing. */
export const CATALOG_CANVAS_WIDTH = 1080;
export const CATALOG_CANVAS_HEIGHT = 1500;
export const CATALOG_SAFE_MARGIN = 52;

export const CATALOG_CONTENT_WIDTH = CATALOG_CANVAS_WIDTH - CATALOG_SAFE_MARGIN * 2;
export const CATALOG_CONTENT_HEIGHT = CATALOG_CANVAS_HEIGHT - CATALOG_SAFE_MARGIN * 2;

export const CATALOG_GRID_GAP = 20;
export const CATALOG_COLUMN_WIDTH =
  (CATALOG_CONTENT_WIDTH - CATALOG_GRID_GAP) / 2;
export const CATALOG_ROW_HEIGHT = 86;
export const CATALOG_ROW_GAP = 8;
export const CATALOG_IMAGE_SIZE = 74;
export const CATALOG_NAME_FONT_SIZE = 14;
export const CATALOG_NAME_LINE_HEIGHT = 17;
export const CATALOG_NAME_HEIGHT = 34;
export const CATALOG_QTY_FONT_SIZE = 13;
export const CATALOG_QTY_SLOT_HEIGHT = 17;
export const CATALOG_NAME_TO_QTY_GAP = 4;
export const CATALOG_PRICE_FONT_SIZE = 15;
export const CATALOG_PRICE_MIN_WIDTH = 82;

export const CATALOG_HEADER_HEIGHT = 218;
export const CATALOG_FOOTER_HEIGHT = 92;

export const CATALOG_GRID_ROWS = Math.floor(
  (CATALOG_CONTENT_HEIGHT -
    CATALOG_HEADER_HEIGHT -
    CATALOG_FOOTER_HEIGHT +
    CATALOG_ROW_GAP) /
    (CATALOG_ROW_HEIGHT + CATALOG_ROW_GAP)
);

export const CATALOG_GRID_COLUMNS = 2;
export const CATALOG_PRODUCTS_PER_PAGE =
  CATALOG_GRID_ROWS * CATALOG_GRID_COLUMNS;

export const CATALOG_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CATALOG_IMAGE_SIZE}" height="${CATALOG_IMAGE_SIZE}" viewBox="0 0 ${CATALOG_IMAGE_SIZE} ${CATALOG_IMAGE_SIZE}">
      <rect width="${CATALOG_IMAGE_SIZE}" height="${CATALOG_IMAGE_SIZE}" rx="10" fill="#f5efe6"/>
      <text x="${CATALOG_IMAGE_SIZE / 2}" y="${CATALOG_IMAGE_SIZE / 2 + 4}" text-anchor="middle" fill="#94a3b8" font-family="Arial,sans-serif" font-size="9">No image</text>
    </svg>`
  );

export const CATALOG_TRUST_BADGES = [
  "Premium Quality",
  "100% Natural",
  "Fresh & Healthy",
] as const;

export const CATALOG_LOGO_SLOT = 72;
export const CATALOG_HEADER_PILL_HEIGHT = 52;
export const CATALOG_HEADER_PILL_MIN_WIDTH = 420;
export const CATALOG_HEADER_PILL_FONT = 16;
export const CATALOG_HEADER_PHONE_FONT = 20;

/** Premium layered background for export. */
export const CATALOG_BG_GRADIENT =
  "linear-gradient(165deg, #fffdf8 0%, #faf6ee 35%, #f3ebe0 70%, #faf6ee 100%)";

export const CATALOG_TEXTURE_BG =
  "radial-gradient(circle at 1px 1px, rgba(26,77,46,0.04) 1px, transparent 0)";

export function paginateCatalogProducts(products: CatalogProduct[]): CatalogProduct[][] {
  if (products.length === 0) return [[]];
  const pages: CatalogProduct[][] = [];
  for (let i = 0; i < products.length; i += CATALOG_PRODUCTS_PER_PAGE) {
    pages.push(products.slice(i, i + CATALOG_PRODUCTS_PER_PAGE));
  }
  return pages;
}

export function splitCatalogColumns(
  products: CatalogProduct[]
): [CatalogProduct[], CatalogProduct[]] {
  const mid = Math.ceil(products.length / 2);
  return [products.slice(0, mid), products.slice(mid)];
}

export function padCatalogColumn(
  products: CatalogProduct[],
  rowCount: number
): Array<CatalogProduct | null> {
  const slots: Array<CatalogProduct | null> = [...products];
  while (slots.length < rowCount) {
    slots.push(null);
  }
  return slots.slice(0, rowCount);
}
