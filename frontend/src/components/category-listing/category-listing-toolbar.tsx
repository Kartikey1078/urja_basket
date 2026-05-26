import type { PriceBounds, ProductFilters } from "@/lib/category-filters";
import type { ProductSortValue } from "@/lib/category-sort";

import { CategoryFilterButton } from "./category-filter-button";
import { CategorySortButton } from "./category-sort-button";

type CategoryListingToolbarProps = {
  productCount: number;
  sort: ProductSortValue | null;
  onSortSelect: (sort: ProductSortValue) => void;
  filters: ProductFilters;
  onFiltersApply: (filters: ProductFilters) => void;
  priceBounds: PriceBounds;
  isSortLoading?: boolean;
  isFilterLoading?: boolean;
  className?: string;
};

export function CategoryListingToolbar({
  productCount,
  sort,
  onSortSelect,
  filters,
  onFiltersApply,
  priceBounds,
  isSortLoading = false,
  isFilterLoading = false,
  className,
}: CategoryListingToolbarProps) {
  return (
    <div className={className} role="toolbar" aria-label="Product list controls">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex justify-start">
          <CategoryFilterButton
            applied={filters}
            onApply={onFiltersApply}
            priceBounds={priceBounds}
            isLoading={isFilterLoading}
          />
        </div>
        <p className="text-muted-foreground text-center text-sm whitespace-nowrap">
          {productCount} Products
        </p>
        <div className="flex justify-end">
          <CategorySortButton
            value={sort}
            onSelect={onSortSelect}
            isLoading={isSortLoading}
          />
        </div>
      </div>
    </div>
  );
}
