import type { CategoryProduct } from "@/lib/category-product-types";

export type ProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  /** Minimum average rating (e.g. 4 = 4★ & above) */
  minRating?: number;
  onSale?: boolean;
  organic?: boolean;
  featured?: boolean;
  inStock?: boolean;
  /** Single nutrition tag — one tap filters products that include this tag */
  nutritionTag?: string;
};

export const EMPTY_PRODUCT_FILTERS: ProductFilters = {};

export type PriceBounds = { min: number; max: number };

export function getPriceBoundsFromProducts(products: CategoryProduct[]): PriceBounds {
  if (products.length === 0) {
    return { min: 0, max: 2000 };
  }
  const prices = products.map((p) => p.price);
  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));
  if (min === max) {
    return { min: Math.max(0, min - 1), max: max + 1 };
  }
  return { min, max };
}

export function countActiveFilters(filters: ProductFilters): number {
  return countCatalogFilters(filters) + (filters.nutritionTag ? 1 : 0);
}

/** Price, rating, and product flags — excludes nutrition tags (separate UI). */
export function countCatalogFilters(filters: ProductFilters): number {
  let n = 0;
  if (filters.minPrice !== undefined) n += 1;
  if (filters.maxPrice !== undefined) n += 1;
  if (filters.minRating !== undefined) n += 1;
  if (filters.onSale) n += 1;
  if (filters.organic) n += 1;
  if (filters.featured) n += 1;
  if (filters.inStock) n += 1;
  return n;
}

export function clearCatalogFilters(filters: ProductFilters): ProductFilters {
  return filters.nutritionTag ? { nutritionTag: filters.nutritionTag } : {};
}

export function filtersAreEqual(a: ProductFilters, b: ProductFilters): boolean {
  return (
    a.minPrice === b.minPrice &&
    a.maxPrice === b.maxPrice &&
    a.minRating === b.minRating &&
    Boolean(a.onSale) === Boolean(b.onSale) &&
    Boolean(a.organic) === Boolean(b.organic) &&
    Boolean(a.featured) === Boolean(b.featured) &&
    Boolean(a.inStock) === Boolean(b.inStock) &&
    a.nutritionTag === b.nutritionTag
  );
}

export function getFilterSummary(filters: ProductFilters): string {
  const chips = describeActiveFilters(filters);
  if (chips.length === 0) return "All products";
  if (chips.length === 1) return chips[0];
  return `${chips.length} filters`;
}

export type ActiveFilterChip = {
  id: string;
  label: string;
};

export function describeActiveFilters(filters: ProductFilters): string[] {
  const labels: string[] = [];
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const lo = filters.minPrice;
    const hi = filters.maxPrice;
    if (lo !== undefined && hi !== undefined) labels.push(`₹${lo}–₹${hi}`);
    else if (lo !== undefined) labels.push(`From ₹${lo}`);
    else if (hi !== undefined) labels.push(`Up to ₹${hi}`);
  }
  if (filters.minRating !== undefined) labels.push(`${filters.minRating}★ & up`);
  if (filters.onSale) labels.push("On sale");
  if (filters.featured) labels.push("Featured");
  if (filters.organic) labels.push("Organic");
  if (filters.inStock) labels.push("In stock");
  return labels;
}

export function getActiveFilterChips(filters: ProductFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (filters.minPrice !== undefined) {
    chips.push({ id: "minPrice", label: `Min ₹${filters.minPrice}` });
  }
  if (filters.maxPrice !== undefined) {
    chips.push({ id: "maxPrice", label: `Max ₹${filters.maxPrice}` });
  }
  if (filters.minRating !== undefined) {
    chips.push({ id: "minRating", label: `${filters.minRating}★ & up` });
  }
  if (filters.onSale) chips.push({ id: "onSale", label: "On sale" });
  if (filters.featured) chips.push({ id: "featured", label: "Featured" });
  if (filters.organic) chips.push({ id: "organic", label: "Organic" });
  if (filters.inStock) chips.push({ id: "inStock", label: "In stock" });
  return chips;
}

export function removeFilterChip(
  filters: ProductFilters,
  chipId: string
): ProductFilters {
  const next = { ...filters };
  if (chipId === "nutritionTag") {
    delete next.nutritionTag;
    return next;
  }
  switch (chipId) {
    case "minPrice":
      delete next.minPrice;
      break;
    case "maxPrice":
      delete next.maxPrice;
      break;
    case "minRating":
      delete next.minRating;
      break;
    case "onSale":
      delete next.onSale;
      break;
    case "featured":
      delete next.featured;
      break;
    case "organic":
      delete next.organic;
      break;
    case "inStock":
      delete next.inStock;
      break;
    default:
      break;
  }
  return next;
}

/** Strip price bounds that match the full catalog range (not a real filter). */
export function normalizeFiltersForApi(
  filters: ProductFilters,
  bounds: PriceBounds
): ProductFilters {
  const out: ProductFilters = { ...filters };
  if (out.minPrice !== undefined && out.minPrice <= bounds.min) delete out.minPrice;
  if (out.maxPrice !== undefined && out.maxPrice >= bounds.max) delete out.maxPrice;
  if (!out.nutritionTag) delete out.nutritionTag;
  return out;
}

export function appendFiltersToSearchParams(
  params: URLSearchParams,
  filters: ProductFilters
): void {
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
  if (filters.onSale) params.set("onSale", "1");
  if (filters.organic) params.set("organic", "1");
  if (filters.featured) params.set("featured", "1");
  if (filters.inStock) params.set("inStock", "1");
  if (filters.nutritionTag) params.set("nutritionTags", filters.nutritionTag);
}

/** Single-select: tap active tag again to clear. */
export function selectNutritionTag(filters: ProductFilters, tag: string): ProductFilters {
  if (filters.nutritionTag === tag) {
    const next = { ...filters };
    delete next.nutritionTag;
    return next;
  }
  return { ...filters, nutritionTag: tag };
}
