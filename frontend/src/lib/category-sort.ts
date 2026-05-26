/** Matches `GET /api/v1/products?sort=` query values. */
export const PRODUCT_SORT_VALUES = ["price_asc", "price_desc"] as const;

export type ProductSortValue = (typeof PRODUCT_SORT_VALUES)[number];

export type SortOption = {
  value: ProductSortValue;
  label: string;
};

export const CATEGORY_SORT_OPTIONS: SortOption[] = [
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export function getSortOptionLabel(value: ProductSortValue | null): string | null {
  if (!value) return null;
  return CATEGORY_SORT_OPTIONS.find((o) => o.value === value)?.label ?? null;
}
