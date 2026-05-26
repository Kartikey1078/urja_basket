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

export function filtersAreEqual(a: ProductFilters, b: ProductFilters): boolean {
  return (
    a.minPrice === b.minPrice &&
    a.maxPrice === b.maxPrice &&
    a.minRating === b.minRating &&
    Boolean(a.onSale) === Boolean(b.onSale) &&
    Boolean(a.organic) === Boolean(b.organic) &&
    Boolean(a.featured) === Boolean(b.featured) &&
    Boolean(a.inStock) === Boolean(b.inStock)
  );
}

export function getFilterSummary(filters: ProductFilters): string {
  const n = countActiveFilters(filters);
  if (n === 0) return "All";
  if (n === 1) return "1 applied";
  return `${n} applied`;
}

/** Strip price bounds that match the full catalog range (not a real filter). */
export function normalizeFiltersForApi(
  filters: ProductFilters,
  bounds: PriceBounds
): ProductFilters {
  const out: ProductFilters = { ...filters };
  if (out.minPrice !== undefined && out.minPrice <= bounds.min) delete out.minPrice;
  if (out.maxPrice !== undefined && out.maxPrice >= bounds.max) delete out.maxPrice;
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
}
